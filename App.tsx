import React, { useState, useCallback, useEffect, useRef } from 'react';
import ImageUploader from './components/ImageUploader';
import { Spinner } from './components/Spinner';
import { mergeImages } from './services/geminiService';
import { UploadedFile } from './types';

const backgroundOptions = [
  { id: 'gray', name: 'Minimalist Gray', prompt: 'clean, aesthetic, minimalist gray studio-style wall', color: 'bg-slate-300' },
  { id: 'beige', name: 'Warm Beige', prompt: 'warm, cozy, beige-colored studio backdrop with soft lighting', color: 'bg-amber-200' },
  { id: 'pastel', name: 'Pastel Blue', prompt: 'soft, pastel blue studio background', color: 'bg-sky-200' },
  { id: 'industrial', name: 'Industrial Loft', prompt: 'textured brick wall of an industrial loft studio', color: 'bg-stone-400' },
];


const App: React.FC = () => {
  const [image1, setImage1] = useState<UploadedFile | null>(null);
  const [image2, setImage2] = useState<UploadedFile | null>(null);
  const [selectedBackground, setSelectedBackground] = useState(backgroundOptions[0]);
  const [mergedImage, setMergedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [currentPage, setCurrentPage] = useState<'setup' | 'result'>('setup');
  const generationCancelled = useRef(false);

  const handleMergeClick = () => {
    if (!image1 || !image2) {
      setError('Please upload both images before merging.');
      return;
    }
    setError(null);
    setCurrentPage('result');
  };

  useEffect(() => {
    const generateImage = async () => {
      if (currentPage === 'result' && image1 && image2) {
        setIsLoading(true);
        setMergedImage(null);
        setError(null);
        generationCancelled.current = false;

        try {
          const resultBase64 = await mergeImages(image1, image2, selectedBackground.prompt);
          if (!generationCancelled.current) {
            setMergedImage(resultBase64);
          }
        } catch (err: any) {
          if (!generationCancelled.current) {
            setError(err.message || 'An unknown error occurred.');
          }
        } finally {
          if (!generationCancelled.current) {
            setIsLoading(false);
          }
        }
      }
    };

    generateImage();
  }, [currentPage, image1, image2, selectedBackground]);

  const handleDownload = useCallback(() => {
    if (!mergedImage) return;

    const link = document.createElement('a');
    link.href = `data:image/png;base64,${mergedImage}`;
    link.download = 'best-friends-photo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [mergedImage]);

  const handleCreateAnother = () => {
    setImage1(null);
    setImage2(null);
    setSelectedBackground(backgroundOptions[0]);
    setMergedImage(null);
    setIsLoading(false);
    setError(null);
    setResetKey(prevKey => prevKey + 1);
    setCurrentPage('setup');
  };

  const handleCancel = () => {
    generationCancelled.current = true;
    setIsLoading(false);
    setCurrentPage('setup');
  }

  const renderSetupPage = () => (
    <>
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-8 shadow-sm" role="alert">
        <p className="font-bold">Pro Tip</p>
        <p>For best results, please upload full-body pictures of each person.</p>
      </div>

      <div className="flex flex-col md:flex-row -m-3">
        <ImageUploader key={`uploader1-${resetKey}`} id="uploader1" title="Person 1" onImageUpload={setImage1} uploadedFile={image1} />
        <ImageUploader key={`uploader2-${resetKey}`} id="uploader2" title="Person 2" onImageUpload={setImage2} uploadedFile={image2} />
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 text-center mb-4">Choose a Background</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {backgroundOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedBackground(option)}
              className={`p-3 text-left rounded-lg border-2 transition-all duration-200 focus:outline-none ${selectedBackground.id === option.id ? 'border-indigo-600 ring-2 ring-indigo-500 ring-offset-2' : 'border-gray-200 hover:border-indigo-400'}`}
              aria-pressed={selectedBackground.id === option.id}
            >
              <div className={`w-full h-16 rounded-md ${option.color} mb-2 border border-black/10`}></div>
              <p className="font-medium text-gray-800 text-sm">{option.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleMergeClick}
          disabled={!image1 || !image2}
          className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
        >
          Create Best Friends Photo
        </button>
        {error && (
            <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative shadow-md max-w-md mx-auto" role="alert">
              <strong className="font-bold">Oh no! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
        )}
      </div>
    </>
  );

  const renderResultPage = () => (
    <div className="mt-12 text-center flex flex-col items-center justify-center">
      {isLoading && (
        <div className="w-full max-w-md">
            <Spinner className="w-12 h-12 mx-auto" />
            <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow-inner">
                <p className="text-lg font-medium text-gray-700">Generating the image...</p>
                <p className="text-sm text-gray-500 mt-1">Our AI is working its magic. This might take a moment.</p>
            </div>
            <button
                onClick={handleCancel}
                className="mt-6 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
                Cancel
            </button>
        </div>
      )}
      {error && !isLoading && (
        <div className="w-full max-w-md">
            <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative shadow-md" role="alert">
                <strong className="font-bold">Generation Failed! </strong>
                <span className="block sm:inline">{error}</span>
            </div>
            <button
                onClick={handleCreateAnother}
                className="mt-6 inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl shadow-sm text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
            >
                Try Again
            </button>
        </div>
      )}
      {mergedImage && !isLoading && (
        <>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Merged Masterpiece!</h2>
          <div className="bg-white p-4 rounded-2xl shadow-2xl inline-block">
            <img
              src={`data:image/png;base64,${mergedImage}`}
              alt="Merged result"
              className="rounded-xl max-w-full h-auto md:max-w-2xl"
            />
          </div>
          <div className="mt-6 flex flex-col sm:flex-row sm:justify-center gap-4">
            <button
              onClick={handleDownload}
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105"
            >
              Download Image
            </button>
            <button
              onClick={handleCreateAnother}
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl shadow-sm text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
            >
              Create Another
            </button>
          </div>
        </>
      )}
    </div>
  );


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Best Friends <span className="text-indigo-600">Photo Merge</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Upload two photos and watch our AI bring them together as best friends in a studio shot!
          </p>
        </header>

        <main>
          {currentPage === 'setup' ? renderSetupPage() : renderResultPage()}
        </main>
      </div>
    </div>
  );
};

export default App;
