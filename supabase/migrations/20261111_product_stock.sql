-- ==============================================================================
-- HORWALLE: STOCK PER PRODUCT / COLOUR / SIZE
-- Additive only. Products keep selling without limits until stock tracking is
-- switched on for them in the admin panel (track_stock defaults to false).
-- ==============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS track_stock boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.product_stock (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color text NOT NULL DEFAULT '',
  size text NOT NULL,
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, color, size)
);

ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;

-- An order holds its stock from the moment it is placed until it is cancelled or deleted.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stock_reserved boolean NOT NULL DEFAULT false;

-- Takes the order's items out of stock, all or nothing.
-- Raises 'OUT_OF_STOCK:<name>|<color>|<size>|<available>' when a line cannot be covered;
-- the whole transaction (every decrement) is then rolled back.
CREATE OR REPLACE FUNCTION public.reserve_order_stock(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  line record;
  available integer;
BEGIN
  -- Lock the order row so two calls for the same order cannot both reserve
  PERFORM 1 FROM orders WHERE id = p_order_id AND stock_reserved = false FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  FOR line IN
    SELECT p.id AS product_id, oi.color, oi.size, max(oi.item_name) AS item_name, sum(oi.quantity)::integer AS qty
    FROM order_items oi
    JOIN products p ON p.id::text = oi.product_id
    WHERE oi.order_id = p_order_id
      AND NOT oi.is_custom
      AND p.track_stock
    GROUP BY p.id, oi.color, oi.size
    ORDER BY p.id, oi.color, oi.size  -- fixed order avoids deadlocks between concurrent orders
  LOOP
    UPDATE product_stock
       SET quantity = quantity - line.qty, updated_at = now()
     WHERE product_id = line.product_id AND color = line.color AND size = line.size
       AND quantity >= line.qty;

    IF NOT FOUND THEN
      SELECT quantity INTO available FROM product_stock
       WHERE product_id = line.product_id AND color = line.color AND size = line.size;
      RAISE EXCEPTION 'OUT_OF_STOCK:%|%|%|%', line.item_name, line.color, line.size, coalesce(available, 0);
    END IF;
  END LOOP;

  UPDATE orders SET stock_reserved = true WHERE id = p_order_id;
END;
$$;

-- Puts a reserved order's items back. Safe to call more than once.
CREATE OR REPLACE FUNCTION public.release_order_stock(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  PERFORM 1 FROM orders WHERE id = p_order_id AND stock_reserved = true FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  INSERT INTO product_stock (product_id, color, size, quantity)
  SELECT p.id, oi.color, oi.size, sum(oi.quantity)::integer
    FROM order_items oi
    JOIN products p ON p.id::text = oi.product_id
   WHERE oi.order_id = p_order_id AND NOT oi.is_custom AND p.track_stock
   GROUP BY p.id, oi.color, oi.size
  ON CONFLICT (product_id, color, size)
  DO UPDATE SET quantity = product_stock.quantity + EXCLUDED.quantity, updated_at = now();

  UPDATE orders SET stock_reserved = false WHERE id = p_order_id;
END;
$$;

-- Only the server (service role) may move stock
REVOKE ALL ON FUNCTION public.reserve_order_stock(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_order_stock(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_order_stock(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_order_stock(uuid) TO service_role;
