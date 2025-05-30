// pages/index.js
"use client";

import { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  // States for the main functionality
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");

  // States for resizing functionality
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [quality, setQuality] = useState(90);
  const [format, setFormat] = useState("jpeg");
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs for DOM manipulation
  const previewRef = useRef(null);
  const resultRef = useRef(null);
  const loaderRef = useRef(null);
  const notifyRef = useRef(null);

  // Notification function
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

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (
      !file ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      return notify(
        "Please select a valid image file (JPG/PNG/WEBP).",
        "error"
      );
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

  // Handle image load to get dimensions
  const handleImageLoad = (e) => {
    const img = e.target;
    setOriginalWidth(img.naturalWidth);
    setOriginalHeight(img.naturalHeight);
    setWidth(img.naturalWidth);
    setHeight(img.naturalHeight);
    setAspectRatio(img.naturalWidth / img.naturalHeight);
  };

  // Handle dimension changes
  const handleDimensionChange = (dimension, value) => {
    const numValue = parseInt(value) || 0;

    if (dimension === "width") {
      setWidth(numValue);
      if (maintainAspect && numValue > 0) {
        setHeight(Math.round(numValue / aspectRatio));
      }
    } else {
      setHeight(numValue);
      if (maintainAspect && numValue > 0) {
        setWidth(Math.round(numValue * aspectRatio));
      }
    }
  };

  // Reset dimensions to original
  const resetDimensions = () => {
    setWidth(originalWidth);
    setHeight(originalHeight);
  };

  // Analyze image (mock function)
  const analyzeImage = () => {
    setIsProcessing(true);
    setLoadingMessage("Analyzing image...");

    // Simulate analysis
    setTimeout(() => {
      const mockResult = {
        fileType: selectedFile.type.split("/")[1].toUpperCase(),
        fileSize: `${Math.round(selectedFile.size / 1024)} KB`,
        dimensions: `${originalWidth} × ${originalHeight}px`,
        dominantColors: ["#4f46e5", "#0ea5e9", "#14b8a6"],
        features: ["Text blocks", "Graphics", "Natural elements"],
        recommendations: [
          "Consider cropping to focus on subject",
          "Adjust brightness for better contrast",
          "Try converting to WebP for smaller file size",
        ],
      };

      setAnalysisResult(mockResult);
      resultRef.current.style.display = "block";
      resultRef.current.scrollIntoView({ behavior: "smooth" });
      setIsProcessing(false);
      notify("Image analysis complete!");
    }, 2000);
  };

  // Download resized image
  const downloadResizedImage = async () => {
    if (!imageUrl || width <= 0 || height <= 0) {
      notify("Please enter valid dimensions for the image", "error");
      return;
    }

    setIsProcessing(true);
    notify("Resizing image...", "info");

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrl;

      await new Promise((resolve) => {
        img.onload = () => {
          canvas.width = width;
          canvas.height = height;

          // Draw image with high quality scaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          resolve();
        };
      });

      // Get the data URL based on selected format
      let mimeType, extension;
      switch (format) {
        case "png":
          mimeType = "image/png";
          extension = "png";
          break;
        case "webp":
          mimeType = "image/webp";
          extension = "webp";
          break;
        default:
          mimeType = "image/jpeg";
          extension = "jpg";
      }

      const dataUrl = canvas.toDataURL(mimeType, quality / 100);

      // Create download link
      const link = document.createElement("a");
      link.download = `resized-image-${width}x${height}.${extension}`;
      link.href = dataUrl;
      link.click();

      notify("Image downloaded successfully!", "success");
    } catch (error) {
      console.error("Error resizing image:", error);
      notify("Failed to resize image. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file deletion
  const handleDeleteFile = () => {
    setSelectedFile(null);
    setImageUrl("");
    previewRef.current.style.display = "none";
    setAnalysisResult("");
    if (resultRef.current) {
      resultRef.current.style.display = "none";
    }
  };

  // Set page title
  useEffect(() => {
    document.title = "Modern Image Converter - Jobkhuzi";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-indigo-50 to-teal-100 flex flex-col items-center py-10 px-4">
      {/* Header */}
      <header className="w-full max-w-6xl text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-indigo-700 bg-clip-text text-transparent mb-3">
          Modern Image Converter
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Transform your images with our AI-powered tool. Upload, analyze, and
          download images in custom sizes with ease.
        </p>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Upload Section */}
          <div className="w-full lg:w-1/2 p-6 md:p-8">
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
                  (Accepted Format: JPG, PNG, WEBP)
                </p>
                <input
                  type="file"
                  id="InputItems"
                  onChange={handleFileUpload}
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={analyzeImage}
                disabled={!selectedFile || isProcessing}
                className={`w-full ${
                  !selectedFile || isProcessing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-teal-600 to-indigo-700 hover:from-teal-700 hover:to-indigo-800"
                } text-white font-bold py-3 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Analyze Image
              </button>
            </div>
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

            <div className="flex-1 rounded-xl bg-white border border-gray-200 flex items-center justify-center p-4 overflow-hidden mb-4">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Uploaded Preview"
                  className="max-h-[300px] object-contain rounded-lg"
                  onLoad={handleImageLoad}
                />
              ) : (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">{loadingMessage}</p>
                </div>
              )}
            </div>

            {/* Resize Controls */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-indigo-700 mb-3">
                Customize Image Size
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) =>
                      handleDimensionChange("width", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    min="1"
                    max="5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) =>
                      handleDimensionChange("height", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    min="1"
                    max="5000"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintain-aspect"
                    checked={maintainAspect}
                    onChange={() => setMaintainAspect(!maintainAspect)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="maintain-aspect"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Maintain aspect ratio
                  </label>
                </div>

                <button
                  type="button"
                  onClick={resetDimensions}
                  className="text-sm text-teal-600 hover:text-teal-800 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reset to original
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WEBP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quality: {quality}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={downloadResizedImage}
                disabled={isProcessing}
                className={`w-full ${
                  isProcessing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-teal-600 to-indigo-700 hover:from-teal-700 hover:to-indigo-800"
                } text-white font-medium py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center`}
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
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
                    Download Custom Size
                  </>
                )}
              </button>

              {originalWidth > 0 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Original: {originalWidth} × {originalHeight}px
                </p>
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

        {analysisResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-indigo-700 mb-3">
                Image Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">File Type</span>
                  <span className="font-medium">{analysisResult.fileType}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">File Size</span>
                  <span className="font-medium">{analysisResult.fileSize}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Dimensions</span>
                  <span className="font-medium">
                    {analysisResult.dimensions}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-indigo-700 mt-6 mb-3">
                Dominant Colors
              </h3>
              <div className="flex space-x-2">
                {analysisResult.dominantColors.map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-xs mt-1">{color}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-indigo-700 mb-3">
                Features Detected
              </h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {analysisResult.features.map((feature, index) => (
                  <span
                    key={index}
                    className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-indigo-700 mb-3">
                Optimization Recommendations
              </h3>
              <ul className="space-y-2">
                {analysisResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-teal-500 mt-0.5 mr-2 flex-shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
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
              Custom Sizes
            </h3>
            <p className="text-gray-600">
              Download your images in any size with our flexible resizing tool.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
          font-family: "Inter", sans-serif;
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
