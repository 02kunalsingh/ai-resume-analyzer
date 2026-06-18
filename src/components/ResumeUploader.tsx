/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Upload, FileText, AlertTriangle, CheckCircle2, Eye, EyeOff } from "lucide-react";

interface ResumeUploaderProps {
  onTextExtracted: (text: string, fileName: string) => void;
  extractedText: string;
  setExtractedText: (text: string) => void;
  fileName: string;
}

export default function ResumeUploader({
  onTextExtracted,
  extractedText,
  setExtractedText,
  fileName
}: ResumeUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(10);

    const fileReader = new FileReader();
    fileReader.onload = async function (e) {
      try {
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          throw new Error("PDF parsing engine is not loaded. Please refresh the page.");
        }

        setProgress(30);
        const typedarray = new Uint8Array(this.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        
        setProgress(50);
        let text = "";
        const numPages = pdf.numPages;

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          text += pageText + "\n\n";
          
          setProgress(Math.min(50 + Math.round((i / numPages) * 45), 95));
        }

        const trimmedText = text.trim();
        if (!trimmedText) {
          throw new Error("No readable text found in the PDF. It may be scanned or empty.");
        }

        setProgress(100);
        setTimeout(() => {
          onTextExtracted(trimmedText, file.name);
          setIsLoading(false);
        }, 500);

      } catch (err: any) {
        console.error("PDF extraction error:", err);
        setError(err.message || "Failed to extract text from PDF. Ensure it is not password-protected.");
        setIsLoading(false);
      }
    };

    fileReader.onerror = () => {
      setError("An error occurred while reading the file.");
      setIsLoading(false);
    };

    fileReader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Upload Resume <span className="text-slate-400 dark:text-slate-500 font-normal">(PDF format)</span>
        </label>
        {extractedText && (
          <button
            type="button"
            onClick={() => setShowReview(!showReview)}
            className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            {showReview ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Hide Raw Text
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                Review Extracted Text
              </>
            )}
          </button>
        )}
      </div>

      {!extractedText && !isLoading ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`relative group cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragging
              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />
          <div className="mx-auto w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-450 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Drag & drop your resume file here or <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:text-indigo-700 dark:group-hover:text-indigo-300">browse</span>
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
            Supports professional PDF files (maximum 10MB)
          </p>
        </div>
      ) : isLoading ? (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <FileText className="absolute w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Extracting resume text...</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">PDF.js parsing pages</p>
            </div>
            <div className="w-48 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/55 text-indigo-600 dark:text-indigo-405 rounded-lg shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-indigo-950 dark:text-indigo-200 truncate">{fileName || "resume.pdf"}</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
              Successfully extracted {extractedText.split(/\s+/).length} words ({extractedText.length} characters)
            </p>
            <div className="flex gap-3 mt-3">
              <button
                type="button"
                onClick={triggerFileSelect}
                className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-805 dark:hover:text-indigo-305 transition-colors"
              >
                Upload different file
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-start gap-2.5 text-sm">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {extractedText && showReview && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
              Extracted Resume Text Review
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Editing this text updates what Gemini analyzes
            </span>
          </div>
          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            rows={8}
            className="w-full text-sm font-mono p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 border border-slate-800 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-550 scrollbar"
            placeholder="Edit extracted resume text here for minor tweaks..."
          />
        </div>
      )}
    </div>
  );
}
