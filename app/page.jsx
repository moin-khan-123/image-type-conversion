// pages/index.js
"use client";

import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [result, setResult] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showText, setShowText] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("Loading image...");
  const loaderRef = useRef(null);
  const resultRef = useRef(null);
  const notifyRef = useRef(null);
  const previewRef = useRef(null);

  const notify = (message, type = "success") => {
    if (notifyRef.current === message) return;
    notifyRef.current = message;
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });
    setTimeout(() => {
      notifyRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    document.title = "Modernize resume - Jobkhuzi";
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !["image/jpeg", "image/png"].includes(file.type)) {
      return notify("Please select a valid image file (JPG/PNG).", "error");
    }

    setSelectedFile(file);
    setLoadingMessage("Processing image...");

    try {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      previewRef.current.style.display = "flex";
    } catch (error) {
      console.error("Error in file processing:", error);
      setLoadingMessage(`Error loading image: ${error.message}`);
      notify(`Error loading image: ${error.message}`, "error");
    }
  };

  const submitCV = async (token) => {
    const fileInput = document.getElementById("InputItems");
    const file = fileInput.files[0];
    if (!file) return notify("Please select an image to upload.", "error");

    loaderRef.current.style.display = "flex";
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate API call
      setTimeout(() => {
        const mockResults = `
          <h2 class="text-xl font-bold text-teal-700 mb-4">Image Analysis Results</h2>
          <div class="bg-teal-50 rounded-lg p-4 mb-4">
            <h3 class="font-semibold text-teal-800 mb-2">Image Information</h3>
            <ul class="list-disc pl-5 space-y-1">
              <li><span class="font-medium">File name:</span> ${file.name}</li>
              <li><span class="font-medium">Type:</span> ${file.type}</li>
              <li><span class="font-medium">Size:</span> ${Math.round(
                file.size / 1024
              )} KB</li>
            </ul>
          </div>
          <div class="bg-indigo-50 rounded-lg p-4 mb-4">
            <h3 class="font-semibold text-indigo-800 mb-2">Content Analysis</h3>
            <p class="mb-2">Your image contains:</p>
            <ul class="list-disc pl-5 space-y-1">
              <li>Text blocks: 4</li>
              <li>Graphics: 2</li>
              <li>Tables: 1</li>
            </ul>
          </div>
          <div class="bg-amber-50 rounded-lg p-4">
            <h3 class="font-semibold text-amber-800 mb-2">Recommendations</h3>
            <ul class="list-disc pl-5 space-y-1">
              <li>Optimize image quality for better text recognition</li>
              <li>Consider converting to PDF for document processing</li>
              <li>Check alignment for better readability</li>
            </ul>
          </div>
        `;
        setResult(mockResults);
        loaderRef.current.style.display = "none";
        resultRef.current.style.display = "block";
        notify("Image uploaded and analyzed successfully!");
        resultRef.current.scrollIntoView({ behavior: "smooth" });
      }, 2000);
    } catch (error) {
      console.error("Error uploading image:", error);
      loaderRef.current.style.display = "none";
      notify(
        error.message || "Error analyzing image. Please try again later.",
        "error"
      );
    }
  };

  const getCaptcha = () => {
    // Simulate reCAPTCHA
    submitCV("dummy-token");
  };

  const toggleTextDisplay = () => setShowText(!showText);

  const handleScrollToggle = (e) => {
    e.preventDefault();
    window.scrollTo({
      top: window.scrollY === 0 ? document.body.scrollHeight : 0,
      behavior: "smooth",
    });
  };

  const handleDeleteFile = () => {
    setSelectedFile(null);
    setImageUrl("");
    previewRef.current.style.display = "none";
  };

  useEffect(() => {
    const cvAnalysis = document.getElementById("CvAnalysis");
    const onSubmit = (event) => {
      event.preventDefault();
      if (!document.getElementById("InputItems").files[0]) {
        return notify("Please select your image", "error");
      }
      loaderRef.current.style.display = "flex";
      getCaptcha();
    };

    cvAnalysis.addEventListener("submit", onSubmit);
    return () => cvAnalysis.removeEventListener("submit", onSubmit);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-indigo-50 to-teal-100 flex flex-col items-center py-10 px-4">
      {/* Header */}
      <header className="w-full max-w-6xl text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-indigo-700 bg-clip-text text-transparent mb-3">
          Modern Image Converter
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Transform your images into actionable insights with our AI-powered
          analysis tool. Upload JPG or PNG files for instant feedback and
          optimization recommendations.
        </p>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Upload Section */}
          <div className="w-full lg:w-1/2 p-6 md:p-8">
            <form id="CvAnalysis" className="w-full">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-teal-800 mb-4">
                  Upload Your Image
                </h2>
                <div
                  className="w-full h-64 p-6 border-3 border-dashed border-teal-300 bg-gradient-to-br from-teal-50 to-indigo-50 rounded-xl transition-all duration-300 hover:shadow-lg cursor-pointer flex flex-col items-center justify-center"
                  onClick={() => document.getElementById("InputItems").click()}
                >
                  <div className="bg-teal-100 p-4 rounded-full mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-teal-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-teal-700">
                    Click to Select Your Image
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    (Accepted Format: JPG, PNG)
                  </p>
                  <input
                    type="file"
                    id="InputItems"
                    onChange={handleFileUpload}
                    accept="image/jpeg, image/png"
                    className="hidden"
                  />
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      onClick={toggleTextDisplay}
                    />
                    <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Submit my image to{" "}
                    <a
                      href="https://jobkhuzi.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-800 font-semibold"
                    >
                      Jobkhuzi
                    </a>{" "}
                    for job matching
                  </span>
                </div>

                {showText && (
                  <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-lg">
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      <li>
                        We do not save or store your information without your
                        consent
                      </li>
                      <li>
                        We do not save any user's information to third parties
                      </li>
                      <li>
                        Data is transmitted via a secure connection over HTTPS
                      </li>
                      <li>
                        Jobkhuzi may use your contact information solely for
                        communication
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg hover:from-teal-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Upload Image
              </button>
            </form>
          </div>

          {/* Preview Section */}
          <div
            ref={previewRef}
            className="w-full lg:w-1/2 bg-gradient-to-br from-indigo-50 to-teal-50 p-6 md:p-8 hidden flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-indigo-800">
                Image Preview
              </h2>
              <button
                className="text-gray-500 hover:text-red-500 transition-colors"
                onClick={handleDeleteFile}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 rounded-xl bg-white border border-gray-200 flex items-center justify-center p-4 overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Uploaded Preview"
                  className="max-h-[400px] object-contain rounded-lg"
                />
              ) : (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">{loadingMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div
        ref={resultRef}
        id="result"
        className="w-full max-w-6xl mt-8 bg-white rounded-2xl shadow-xl p-6 md:p-8 hidden animate-fadeIn"
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-teal-800">Analysis Results</h2>
          <button
            className="text-gray-500 hover:text-teal-700 transition-colors"
            onClick={() => {
              resultRef.current.style.display = "none";
              handleDeleteFile();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: result }}
        />
      </div>

      {/* Features Section */}
      <div className="w-full max-w-6xl mt-10">
        <h2 className="text-3xl font-bold text-center text-teal-800 mb-8">
          Powerful Image Processing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="bg-teal-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-teal-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Quick Analysis
            </h3>
            <p className="text-gray-600">
              Get instant insights about your images with our AI-powered
              analysis engine.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Secure Processing
            </h3>
            <p className="text-gray-600">
              Your files are processed securely and never stored without your
              permission.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="bg-amber-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Optimization Tips
            </h3>
            <p className="text-gray-600">
              Receive actionable recommendations to improve your image quality.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={handleScrollToggle}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-teal-600 to-indigo-700 text-white rounded-full p-3 shadow-lg hover:from-teal-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-110"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>

      {/* Loader */}
      <div
        ref={loaderRef}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden"
      >
        <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-lg font-medium text-gray-800">
            Processing your image...
          </p>
        </div>
      </div>

      <ToastContainer />

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        body {
          background-color: #f0fdfa;
        }

        .Toastify__toast--success {
          background: linear-gradient(to right, #0d9488, #0891b2) !important;
          border-radius: 10px !important;
        }

        .Toastify__toast--error {
          background: linear-gradient(to right, #ef4444, #dc2626) !important;
          border-radius: 10px !important;
        }

        .Toastify__progress-bar {
          height: 4px !important;
        }
      `}</style>
    </div>
  );
}
