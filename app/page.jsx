"use client";

import { useState, useEffect, useRef } from "react";
import "remixicon/fonts/remixicon.css";
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
  const RECAPTCHA_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_KEY;

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
      previewRef.current.style.display = "block";
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
      const response = await fetch(process.env.NEXT_PUBLIC_ANALYZE_CV, {
        method: "POST",
        headers: { "g-reCaptcha": token },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.results) {
        throw new Error("No analysis data returned from server.");
      }

      const converter = new Showdown.Converter();
      setResult(converter.makeHtml(data.results));
      loaderRef.current.style.display = "none";
      resultRef.current.style.display = "flex";
      notify("Image uploaded and analyzed successfully!");
      resultRef.current.scrollIntoView({ behavior: "smooth" });
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
    if (typeof grecaptcha !== "undefined") {
      grecaptcha.ready(async () => {
        const response = await grecaptcha.execute(RECAPTCHA_KEY, {
          action: "submit",
        });
        await submitCV(response);
      });
    } else {
      console.error("grecaptcha is not loaded");
      notify("reCAPTCHA is not loaded. Please try again.", "error");
    }
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
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-200 via-blue-300 to-indigo-300 flex flex-col items-center justify-center py-10">
      <div ref={loaderRef} className="hidden" />

      <div
        className={`main-content bg-white shadow-2xl rounded-2xl p-4 w-11/12 flex flex-col items-center lg:flex-row gap-6 ${
          selectedFile ? "max-w-6xl" : "max-w-2xl"
        }`}
      >
        <div className="upload-section flex-1 m-5">
          <h1 className="text-3xl md:text-[45px] font-extrabold text-primary mb-4 md:mb-6 text-[#5471ff] text-center">
            Image-Converter Tool
          </h1>
          <p className="text-sm md:text-lg text-gray-700 mb-4 md:mb-6 text-center">
            Upload your image to get instant feedback and insights.
          </p>

          <form id="CvAnalysis" className="w-full">
            <div className="w-full h-auto p-6 md:p-8 border-4 border-dashed border-blue-400 bg-blue-100 rounded-xl transition hover:shadow-md">
              <label
                htmlFor="InputItems"
                className="w-full text-center cursor-pointer"
              >
                <p className="text-lg md:text-xl font-medium text-primary">
                  Click to Select Your Image
                </p>
                <p className="text-xs md:text-sm text-gray-600 mt-2">
                  (Accepted Format: JPG, PNG)
                </p>
                <input
                  type="file"
                  id="InputItems"
                  onChange={handleFileUpload}
                  accept="image/jpeg, image/png"
                  hidden
                />
              </label>
            </div>

            <div className="down-content mt-6">
              <div className="flex justify-center">
                <div className="form-check form-switch pb-2 flex items-center space-x-2">
                  <input
                    className="form-check-input h-5 w-10 md:h-6 md:w-11 rounded-full bg-gray-300 border-transparent checked:bg-green-500 transition duration-200"
                    onClick={toggleTextDisplay}
                    type="checkbox"
                    role="switch"
                    id="flexSwitchCheckDefault"
                  />
                  <label
                    className="form-check-label text-xs md:text-sm font-medium text-gray-700"
                    htmlFor="flexSwitchCheckDefault"
                  >
                    Submit my image to{" "}
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary"
                      href="https://jobkhuzi.com/"
                    >
                      Jobkhuzi
                    </a>{" "}
                    for job matching.
                  </label>
                </div>
              </div>

              {showText && (
                <div className="bg-gray-100 p-3 md:p-4 rounded-lg shadow-lg">
                  <ul className="list-disc pl-4 md:pl-6 text-gray-700 text-xs md:text-sm space-y-1 md:space-y-2">
                    <li>
                      We do not save or store your information without your
                      consent.
                    </li>
                    <li>
                      We do not save any user's information to third parties.
                    </li>
                    <li>
                      Data is transmitted via a secure connection over HTTPS.
                    </li>
                    <li>
                      Jobkhuzi may use your contact information solely for
                      communication.
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleScrollToggle}
              className="fixed bottom-20 right-5 bg-blue-600 text-white rounded-full p-3 md:p-4 shadow-lg hover:bg-blue-700 transition duration-200 transform hover:scale-105"
            >
              <i className="ri-arrow-up-s-line text-xl md:text-2xl"></i>
            </button>

            <button
              type="submit"
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 md:py-3 rounded-lg shadow-lg transition"
            >
              Upload Image
            </button>
          </form>
        </div>

        {selectedFile && (
          <div
            ref={previewRef}
            className="pdf-preview-container flex-1 bg-gray-50 p-3 md:p-4 rounded-lg shadow-md hidden sm:block"
          >
            <div className="flex justify-end">
              <button
                className="btn text-red-500 text-3xl"
                onClick={handleDeleteFile}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Uploaded Preview"
                className="rounded-md object-contain max-h-[560px] w-full"
              />
            ) : (
              <p>{loadingMessage}</p>
            )}
          </div>
        )}
      </div>

      <div
        ref={resultRef}
        id="result"
        className="m-5 mt-6 md:mt-10 hidden animate-fadeIn w-11/12 max-w-2xl md:max-w-6xl bg-white p-6 md:p-8 rounded-xl shadow-md"
      >
        <div dangerouslySetInnerHTML={{ __html: result }} />
      </div>

      <ToastContainer />
    </div>
  );
}
