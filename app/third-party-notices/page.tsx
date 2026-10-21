import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText } from "lucide-react";

export const metadata = {
  title: "Üçüncü Tərəf Bildirişləri və Açıq Mənbə Lisenziyaları | HORVVALLE ATELIER",
  description: "HORVVALLE ATELIER 3D Studiyasında istifadə olunan açıq mənbəli süni intellekt və render kitabxanalarının lisenziya məlumatları.",
};

export default function ThirdPartyNoticesPage() {
  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#111827] pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Back */}
        <Link
          href="/studio"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition mb-6"
        >
          <ArrowLeft size={14} />
          <span>Studiyaya qayıt</span>
        </Link>

        {/* Header */}
        <div className="pb-8 border-b border-stone-200">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck size={14} className="text-emerald-700" />
            <span>Açıq Mənbə və Lisenziya Şəffaflığı</span>
          </div>
          <h1 className="font-eb-garamond text-3xl sm:text-4xl text-stone-900">
            Üçüncü Tərəf Bildirişləri
          </h1>
          <p className="text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
            HORVVALLE ATELIER 3D Fərdi Çap Studiyası heç bir ödənişli xarici API və ya qeyri-kommersiya məhdudiyyətli xidmət istifadə etmir.
            Bütün süni intellekt ilə fon silmə və 3D canlı baxış funksiyaları 100% istifadəçinin brauzerində açıq mənbəli, kommersiya istifadəsinə icazə verən lisenziyalar əsasında işləyir.
          </p>
        </div>

        {/* Notices Section */}
        <div className="mt-8 space-y-8">
          
          {/* 1. IS-Net (DIS) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-stone-900">
                  1. IS-Net: Image Segmentation Network (General Use)
                </h2>
                <p className="text-xs text-stone-500">
                  Müəlliflər: Xuebin Qin, Zichen Zhang, Chenyang Huang, Chao Gao, Masood Dehghan, Martin Jagersand (2022)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold font-mono">
                Apache License 2.0
              </span>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              IS-Net modeli obyekti fondan yüksək dəqiqliklə ayırmaq üçün istifadə olunur. Model ONNX formatına çevrilmiş, int8 kvantlaşdırılmış və istifadəçinin brauzerində WebGPU/WASM vasitəsilə işə salınır.
            </p>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 font-mono text-[11px] text-stone-700 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Reference Paper: "Highly Accurate Dichotomous Image Segmentation", ECCV 2022.`}
            </div>
          </div>

          {/* 2. ONNX Runtime Web */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-stone-900">
                  2. ONNX Runtime Web (Microsoft Corporation)
                </h2>
                <p className="text-xs text-stone-500">
                  Müəllif hüququ: © Microsoft Corporation. Bütün hüquqlar qorunur.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono">
                MIT License
              </span>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              ONNX Runtime Web süni intellekt modellərini müştəri brauzerində yerli WebGPU və WebAssembly (WASM) ilə yüksək sürətlə icra edən açıq mənbəli mühərrikdir.
            </p>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 font-mono text-[11px] text-stone-700 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`MIT License

Copyright (c) Microsoft Corporation.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
            </div>
          </div>

          {/* 3. Three.js */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-stone-900">
                  3. Three.js 3D WebGL Library
                </h2>
                <p className="text-xs text-stone-500">
                  Müəllif hüququ: © 2010-2024 Three.js Authors
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono">
                MIT License
              </span>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              Studiyada interaktiv 3D canlı baxış və relyefli geyim simulyasiyası Three.js WebGL kitabxanası əsasında qurulmuşdur.
            </p>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 font-mono text-[11px] text-stone-700 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`MIT License

Copyright © 2010-2024 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.`}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
