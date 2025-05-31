// pages/index.js
"use client";

import { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  // States
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [quality, setQuality] = useState(90);
  const [format, setFormat] = useState("jpeg");
  const [isProcessing, setIsProcessing] = useState(false);
  const [presetSizes, setPresetSizes] = useState([
    { name: "Instagram Post", width: 1080, height: 1080 },
    { name: "Facebook Cover", width: 820, height: 312 },
    { name: "Twitter Header", width: 1500, height: 500 },
    { name: "LinkedIn Post", width: 1200, height: 627 },
  ]);
  const [rotation, setRotation] = useState(0);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
  });
  const [activeTab, setActiveTab] = useState("resize");

  // Refs
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
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type
      )
    ) {
      return notify(
        "Please select a valid image file (JPG, PNG, WEBP, GIF).",
        "error"
      );
    }

    setSelectedFile(file);
    setLoadingMessage("Processing image...");

    try {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      previewRef.current.style.display = "flex";
      notify("Image uploaded successfully!");
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
    setRotation(0);
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      grayscale: 0,
    });
  };

  // Apply preset size
  const applyPresetSize = (preset) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setMaintainAspect(false);
    notify(`Applied ${preset.name} dimensions`);
  };

  // Analyze image
  const analyzeImage = () => {
    if (!selectedFile) {
      notify("Please upload an image first", "error");
      return;
    }

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
          "Rotate image for better composition",
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
    notify("Processing image...", "info");

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

          // Apply rotation
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);

          // Apply filters
          ctx.filter = `
            brightness(${filters.brightness}%)
            contrast(${filters.contrast}%)
            saturate(${filters.saturation}%)
            grayscale(${filters.grayscale}%)
          `;

          // Draw image with high quality scaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);
          ctx.restore();

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
        case "gif":
          mimeType = "image/gif";
          extension = "gif";
          break;
        default:
          mimeType = "image/jpeg";
          extension = "jpg";
      }

      const dataUrl = canvas.toDataURL(mimeType, quality / 100);

      // Create download link
      const link = document.createElement("a");
      link.download = `converted-image-${width}x${height}.${extension}`;
      link.href = dataUrl;
      link.click();

      notify("Image downloaded successfully!", "success");
    } catch (error) {
      console.error("Error processing image:", error);
      notify("Failed to process image. Please try again.", "error");
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
    resetDimensions();
  };

  // Set page title
  useEffect(() => {
    document.title = "Advanced Image Converter - Jobkhuzi";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-teal-50 to-purple-50 flex flex-col items-center py-10 px-4">
      {/* Header */}
      <header className="w-full max-w-6xl text-center mb-10">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-4 rounded-2xl shadow-lg transform transition-transform hover:scale-105">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-14 w-14 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-indigo-700 bg-clip-text text-transparent mb-3">
          Advanced Image Converter
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Transform, optimize, and download images with our powerful AI-powered
          tool. Perfect for social media, websites, and professional use.
        </p>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border border-indigo-100">
        <div className="flex flex-col lg:flex-row">
          {/* Upload Section */}
          <div className="w-full lg:w-2/5 p-6 md:p-8 bg-gradient-to-br from-indigo-50 to-teal-50">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-indigo-600"
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
                Upload Your Image
              </h2>
              <div
                className="w-full h-64 p-6 border-2 border-dashed border-indigo-300 rounded-2xl transition-all duration-300 hover:shadow-lg cursor-pointer flex flex-col items-center justify-center bg-white group"
                onClick={() => document.getElementById("InputItems").click()}
              >
                <div className="bg-indigo-100 p-4 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:bg-indigo-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-indigo-600 group-hover:text-indigo-800"
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
                <p className="text-lg font-medium text-indigo-700 text-center group-hover:text-indigo-800">
                  Drag & drop your image here
                  <br />
                  or click to browse
                </p>
                <p className="text-sm text-gray-600 mt-2 group-hover:text-gray-700">
                  Supported formats: JPG, PNG, WEBP, GIF
                </p>
                <input
                  type="file"
                  id="InputItems"
                  onChange={handleFileUpload}
                  accept="image/jpeg, image/png, image/webp, image/gif"
                  className="hidden"
                />
              </div>
            </div>

            {selectedFile && (
              <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-teal-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  File Info
                </h3>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Name:</span>
                  <span className="ml-2 truncate max-w-[180px]">
                    {selectedFile.name}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <span className="font-medium">Type:</span>
                  <span className="ml-2">
                    {selectedFile.type.split("/")[1].toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <span className="font-medium">Size:</span>
                  <span className="ml-2">
                    {Math.round(selectedFile.size / 1024)} KB
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <button
                onClick={analyzeImage}
                disabled={!selectedFile || isProcessing}
                className={`w-full ${
                  !selectedFile || isProcessing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700"
                } text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center group`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 group-hover:animate-pulse"
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
            className="w-full lg:w-3/5 bg-gradient-to-br from-teal-50 to-indigo-50 p-6 md:p-8 hidden flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-teal-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Image Preview & Editing
              </h2>
              <button
                className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
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

            <div className="flex-1 rounded-xl bg-white border border-gray-200 flex items-center justify-center p-4 overflow-hidden mb-4 relative min-h-[300px]">
              {imageUrl ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Uploaded Preview"
                    className="max-h-[280px] object-contain rounded-lg"
                    onLoad={handleImageLoad}
                    style={{
                      filter: `
                        brightness(${filters.brightness}%)
                        contrast(${filters.contrast}%)
                        saturate(${filters.saturation}%)
                        grayscale(${filters.grayscale}%)
                      `,
                      transform: `rotate(${rotation}deg)`,
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {width}×{height}px
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">{loadingMessage}</p>
                </div>
              )}
            </div>

            {/* Editing Controls */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  className={`px-4 py-2 font-medium text-sm md:text-base transition-colors ${
                    activeTab === "resize"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-600 hover:text-indigo-500"
                  }`}
                  onClick={() => setActiveTab("resize")}
                >
                  Resize
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm md:text-base transition-colors ${
                    activeTab === "adjust"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-600 hover:text-indigo-500"
                  }`}
                  onClick={() => setActiveTab("adjust")}
                >
                  Adjust
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm md:text-base transition-colors ${
                    activeTab === "presets"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-600 hover:text-indigo-500"
                  }`}
                  onClick={() => setActiveTab("presets")}
                >
                  Presets
                </button>
              </div>

              {activeTab === "resize" && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1 text-indigo-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 9V5a3 3 0 013-3h4a3 3 0 013 3v4a3 3 0 01-3 3h-4a3 3 0 01-3-3zm0 10v-4a3 3 0 013-3h4a3 3 0 013 3v4a3 3 0 01-3 3h-4a3 3 0 01-3-3z"
                          />
                        </svg>
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) =>
                          handleDimensionChange("width", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="1"
                        max="5000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1 text-indigo-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 9V5a3 3 0 013-3h4a3 3 0 013 3v4a3 3 0 01-3 3h-4a3 3 0 01-3-3zm10 0V5a3 3 0 00-3-3h-4a3 3 0 00-3 3v4a3 3 0 003 3h4a3 3 0 003-3z"
                          />
                        </svg>
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) =>
                          handleDimensionChange("height", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center transition-colors"
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
                </>
              )}

              {activeTab === "adjust" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      Rotation: {rotation}°
                    </label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brightness: {filters.brightness}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={filters.brightness}
                      onChange={(e) =>
                        setFilters({ ...filters, brightness: e.target.value })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contrast: {filters.contrast}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={filters.contrast}
                      onChange={(e) =>
                        setFilters({ ...filters, contrast: e.target.value })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Saturation: {filters.saturation}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={filters.saturation}
                      onChange={(e) =>
                        setFilters({ ...filters, saturation: e.target.value })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grayscale: {filters.grayscale}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.grayscale}
                      onChange={(e) =>
                        setFilters({ ...filters, grayscale: e.target.value })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {activeTab === "presets" && (
                <div className="grid grid-cols-2 gap-3">
                  {presetSizes.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => applyPresetSize(preset)}
                      className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg p-3 text-center transition-all transform hover:scale-[1.03]"
                    >
                      <div className="font-medium text-indigo-700">
                        {preset.name}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {preset.width}×{preset.height}px
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WEBP</option>
                    <option value="gif">GIF</option>
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
                className={`w-full mt-4 ${
                  isProcessing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700"
                } text-white font-medium py-3 rounded-lg transition-all duration-300 flex items-center justify-center group`}
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                      className="h-5 w-5 mr-2 group-hover:animate-bounce"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Download Custom Image
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
        className="w-full max-w-6xl mt-8 bg-white rounded-2xl shadow-xl p-6 md:p-8 hidden animate-fadeIn border border-indigo-100"
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-indigo-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Analysis Results
          </h2>
          <button
            className="text-gray-500 hover:text-indigo-700 transition-colors"
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
            <div className="bg-gradient-to-br from-indigo-50 to-teal-50 rounded-xl p-5 border border-indigo-100 shadow-sm">
              <h3 className="text-lg font-semibold text-indigo-700 mb-3 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Image Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-indigo-100">
                  <span className="text-gray-600">File Type</span>
                  <span className="font-medium text-indigo-700">
                    {analysisResult.fileType}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-indigo-100">
                  <span className="text-gray-600">File Size</span>
                  <span className="font-medium text-indigo-700">
                    {analysisResult.fileSize}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-indigo-100">
                  <span className="text-gray-600">Dimensions</span>
                  <span className="font-medium text-indigo-700">
                    {analysisResult.dimensions}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-indigo-700 mt-6 mb-3 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
                Dominant Colors
              </h3>
              <div className="flex space-x-2">
                {analysisResult.dominantColors.map((color, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center transition-transform duration-300 hover:scale-105"
                  >
                    <div
                      className="w-10 h-10 rounded-full border border-gray-200 shadow-sm"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-xs mt-1 text-gray-600">{color}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-indigo-50 rounded-xl p-5 border border-teal-100 shadow-sm">
              <h3 className="text-lg font-semibold text-teal-700 mb-3 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Features Detected
              </h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {analysisResult.features.map((feature, index) => (
                  <span
                    key={index}
                    className="bg-teal-100 text-teal-800 text-sm px-3 py-1 rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-teal-700 mb-3 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Optimization Recommendations
              </h3>
              <ul className="space-y-3">
                {analysisResult.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="flex items-start bg-white rounded-lg p-3 shadow-sm"
                  >
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
        <h2 className="text-3xl font-bold text-center text-indigo-800 mb-8">
          Powerful Image Processing Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-gradient-to-r from-indigo-100 to-teal-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
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
                  strokeWidth={1.5}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              AI-Powered Analysis
            </h3>
            <p className="text-gray-600">
              Get detailed insights about your images with our advanced analysis
              engine.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-gradient-to-r from-teal-100 to-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
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
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Secure Processing
            </h3>
            <p className="text-gray-600">
              All processing happens in your browser. Your images never leave
              your device.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Advanced Editing
            </h3>
            <p className="text-gray-600">
              Resize, rotate, adjust filters, and apply presets for perfect
              results.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="w-full max-w-6xl mt-12 mb-8">
        <h2 className="text-3xl font-bold text-center text-teal-800 mb-8">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Saiful Azad",
              role: "Social Media Manager",
              content:
                "This tool saved me hours of work! The preset sizes for social media are perfect, and the quality is amazing.",
              avatar: "SJ",
            },
            {
              name: "Boss Resel",
              role: "Web Developer",
              content:
                "The browser-based processing is a game-changer. No need to upload sensitive images to third-party servers.",
              avatar: "MC",
            },
            {
              name: "Shamsul Samrat",
              role: "Photographer",
              content:
                "The advanced editing features rival desktop software. The filters and rotation tools are incredibly useful.",
              avatar: "ER",
            },
          ].map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 text-indigo-700 w-12 h-12 rounded-full flex items-center justify-center font-bold mr-3">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"{testimonial.content}"</p>
              <div className="flex mt-4 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-6xl mt-8 pt-8 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-2 rounded-xl mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-indigo-700 bg-clip-text text-transparent">
                Advanced Image Converter
              </h3>
            </div>
            <p className="text-gray-600 text-sm mt-2">
              Transform your images with our powerful AI-powered tool
            </p>
          </div>
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
        <p className="text-center text-gray-500 text-sm mt-6">
          © {new Date().getFullYear()} Advanced Image Converter. All rights
          reserved.
        </p>
      </footer>

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-teal-600 text-white rounded-full p-3 shadow-lg hover:from-indigo-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-110"
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
          background-color: #f5f7ff;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
            sans-serif;
        }

        .Toastify__toast--success {
          background: linear-gradient(to right, #0d9488, #0891b2) !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }

        .Toastify__toast--error {
          background: linear-gradient(to right, #ef4444, #dc2626) !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }

        .Toastify__toast--info {
          background: linear-gradient(to right, #3b82f6, #6366f1) !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }

        .Toastify__progress-bar {
          height: 4px !important;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #4f46e5;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #4f46e5;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
