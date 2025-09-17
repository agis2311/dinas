
import React, { useState, useCallback } from 'react';
import { AppStatus } from './types';
import type { ImageData } from './types';
import { generateProfessionalPhoto } from './services/geminiService';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Loader } from './components/Loader';

const DEFAULT_PROMPT = "Jadikan produk ini terlihat seperti di atas meja marmer putih dengan pencahayaan yang lembut dan alami.";

const App: React.FC = () => {
    const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
    const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
    const [generatedImage, setGeneratedImage] = useState<ImageData | null>(null);
    const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = (imageData: ImageData) => {
        setOriginalImage(imageData);
        setGeneratedImage(null);
        setError(null);
        setStatus(AppStatus.IDLE);
    };

    const handleGeneration = useCallback(async () => {
        if (!originalImage) return;

        setStatus(AppStatus.PROCESSING);
        setError(null);
        setGeneratedImage(null);

        try {
            const result = await generateProfessionalPhoto(originalImage, prompt);
            if (result.newImage) {
                setGeneratedImage(result.newImage);
                setStatus(AppStatus.SUCCESS);
            } else {
                throw new Error(result.textResponse || "Gagal menghasilkan gambar, AI tidak mengembalikan gambar.");
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan yang tidak diketahui.');
            setStatus(AppStatus.ERROR);
        }
    }, [originalImage, prompt]);
    
    const handleStartOver = () => {
        setStatus(AppStatus.IDLE);
        setOriginalImage(null);
        setGeneratedImage(null);
        setError(null);
        setPrompt(DEFAULT_PROMPT);
    };

    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = `data:${generatedImage.mimeType};base64,${generatedImage.base64}`;
        link.download = `professional_${originalImage?.name || 'photo'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const isProcessing = status === AppStatus.PROCESSING;

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <Header />
            <main className="flex-grow container mx-auto p-4 sm:p-8">
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-5xl mx-auto">
                    {!originalImage ? (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-700 mb-2">Ubah Foto Produk Anda Menjadi Profesional</h2>
                            <p className="text-gray-500 mb-6 max-w-2xl mx-auto">Cukup unggah foto produk Anda, dan biarkan AI canggih kami mengubahnya menjadi gambar berkualitas studio yang siap untuk e-commerce.</p>
                            <ImageUploader onImageUpload={handleImageUpload} disabled={isProcessing} />
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
                                {/* Original Image and Prompt */}
                                <div className="flex flex-col space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700">1. Foto Asli & Arahan</h3>
                                    <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden border">
                                        <img 
                                          src={`data:${originalImage.mimeType};base64,${originalImage.base64}`} 
                                          alt="Original Product" 
                                          className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">Jelaskan gaya yang Anda inginkan:</label>
                                        <textarea
                                            id="prompt"
                                            rows={3}
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            disabled={isProcessing}
                                            placeholder="contoh: di atas meja kayu dengan latar belakang tanaman"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleGeneration} 
                                        disabled={isProcessing}
                                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                    >
                                      {isProcessing ? 'Memproses...' : 'Buat Foto Profesional'}
                                      {isProcessing && <svg className="animate-spin ml-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                    </button>
                                </div>

                                {/* Generated Image */}
                                <div className="flex flex-col space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700">2. Hasil Foto AI</h3>
                                    <div className="relative aspect-square w-full bg-gray-100 rounded-lg border flex items-center justify-center">
                                        {isProcessing && <Loader />}
                                        {error && (
                                            <div className="p-4 text-center text-red-700">
                                                <p className="font-bold">Oops! Terjadi Kesalahan</p>
                                                <p className="text-sm">{error}</p>
                                            </div>
                                        )}
                                        {generatedImage && (
                                            <img
                                                src={`data:${generatedImage.mimeType};base64,${generatedImage.base64}`}
                                                alt="Generated Product"
                                                className="w-full h-full object-contain"
                                            />
                                        )}
                                        {!isProcessing && !error && !generatedImage && (
                                            <div className="p-4 text-center text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                <p className="mt-2">Hasil foto AI Anda akan muncul di sini.</p>
                                            </div>
                                        )}
                                    </div>
                                    {status === AppStatus.SUCCESS && generatedImage && (
                                         <button 
                                            onClick={handleDownload} 
                                            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Unduh Hasil
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                                <button
                                    onClick={handleStartOver}
                                    className="text-blue-600 hover:underline"
                                >
                                    Mulai Lagi dengan Foto Baru
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <footer className="text-center p-4 text-sm text-gray-500">
                © {new Date().getFullYear()} Dinas Koperasi dan UMKM Kabupaten Sukabumi. Didukung oleh Teknologi AI.
            </footer>
        </div>
    );
};

export default App;
