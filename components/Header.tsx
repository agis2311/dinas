
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md p-4">
      <div className="container mx-auto flex items-center justify-center text-center sm:justify-between">
        <div className="flex items-center space-x-3">
            <img src="https://seeklogo.com/images/S/sukabumi-kabupaten-logo-8404222067-seeklogo.com.png" alt="Logo Kabupaten Sukabumi" className="h-12 w-12 object-contain"/>
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Foto Produk Profesional AI</h1>
                <p className="text-sm text-gray-500">Dinas Koperasi dan UMKM Kabupaten Sukabumi</p>
            </div>
        </div>
      </div>
    </header>
  );
};
