/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  FileText, 
  Briefcase, 
  HelpCircle, 
  AlertTriangle, 
  MousePointerClick, 
  RefreshCw, 
  BookOpen, 
  Globe,
  ChevronDown,
  Sun,
  Moon
} from "lucide-react";
import ResumeUploader from "./components/ResumeUploader";
import AnalysisDashboard from "./components/AnalysisDashboard";
import { ResumeAnalysisResult } from "./types";
import { SAMPLE_RESUME, SAMPLE_JOB_DESCRIPTION, SAMPLE_ROLE_TITLE } from "./sampleData";

const ROLE_PRESETS = [
  "Fullstack Developer",
  "Python Developer",
  "Java Developer",
  "Flutter Developer",
  "Frontend Engineer",
  "Backend Engineer",
  "DevOps Engineer",
  "Data Scientist"
];

const getJobDescriptionValidationError = (text: string): string | null => {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // 1. Check if it's too short
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 15) {
    return "The text you pasted is extremely short. Please copy and paste a complete Job Description with professional requirements or responsibilities.";
  }

  // 2. Check for standard programming code / syntax markers
  const codeMarkers = [
    /import\s+[\w{}*,\s]+\s+from\s+['"][^'"]+['"]/i, // ES import
    /const\s+\w+\s*=\s*/, // JS const
    /let\s+\w+\s*=\s*/, // JS let
    /function\s+\w+\s*\(/, // JS function
    /public\s+class\s+\w+/, // Java class/method
    /package\s+[\w.]+;/, // Java package
    /namespace\s+[\w.]+/, // C# namespace
    /def\s+\w+\s*\(.*?\)\s*:/, // Python def
    /#include\s+<[\w.]+>/, // C++ include
    /<\?php/, // PHP
    /<\/?[a-z][\s\S]*>/i, // HTML tag
    /SELECT\s+.+FROM\s+/i, // SQL SELECT
    /{"[\w_]+"\s*:/ // JSON object block
  ];

  const matchedMarker = codeMarkers.find(regex => regex.test(trimmed));
  if (matchedMarker) {
    return "This text looks like software source code or markup. Please make sure to copy and paste a real, readable corporate Job Description containing responsibilities and required qualifications.";
  }

  // 3. Ratio of punctuation to general characters
  const totalChars = trimmed.length;
  const specialCharsCount = (trimmed.match(/[{};<>=()\[\]]/g) || []).length;
  if (totalChars > 50 && (specialCharsCount / totalChars) > 0.08) {
    return "This text contains an unusually high ratio of brackets/semicolons, indicating it could be programming code. Please paste a standard Job Description.";
  }

  // 4. Check for absolute absence of critical job terms in reasonably long text
  const jdKeywords = [
    /\bjob\b/i, /\brole\b/i, /\bteam\b/i, /\bwork\b/i, /\bexperienc/i, /\bresponsibilit/i,
    /\brequirement/i, /\bskill\b/i, /\bqualific/i, /\bdevelop/i, /\bdesign/i,
    /\bposition\b/i, /\btech\w*\b/i, /\bclient\w*\b/i, /\bmanag/i
  ];
  
  const matchedKeywordsCount = jdKeywords.filter(regex => regex.test(trimmed)).length;
  const keywordRatio = matchedKeywordsCount / jdKeywords.length;

  if (words.length >= 30 && keywordRatio < 0.12) {
    return "This text doesn't appear to contain keywords typical of job descriptions (such as roles, requirements, responsibilities, or teams). Please double-check what was pasted.";
  }

  return null;
};

export default function App() {
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [selectValue, setSelectValue] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) return savedTheme === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const jdValidationError = getJobDescriptionValidationError(jobDescription);

  // Sync role select dropdown with roleTitle state changes
  useEffect(() => {
    if (ROLE_PRESETS.includes(roleTitle)) {
      setSelectValue(roleTitle);
    } else if (roleTitle === "") {
      setSelectValue("");
    } else {
      setSelectValue("other");
    }
  }, [roleTitle]);

  // Analysis steps checklist for beautiful feedback
  const loadingSteps = [
    "Extracting candidate engineering history...",
    "Mining Job Description for required tooling...",
    "Aligning technical and soft capability patterns...",
    "Measuring keyword frequency and ATS weights...",
    "Synthesizing section-by-section improvements...",
    "Drafting tailored, metric-driven resume bullets..."
  ];

  // Cycle the loading step every 2 seconds for a premium, highly informative experience
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleTextExtracted = (text: string, file: string) => {
    setResumeText(text);
    setFileName(file);
    setError(null);
  };

  const handleLoadDemo = () => {
    setResumeText(SAMPLE_RESUME);
    setFileName("Alex_Mercer_Resume_Demo.pdf");
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    setRoleTitle(SAMPLE_ROLE_TITLE);
    setError(null);
  };

  const handleClearInputs = () => {
    setResumeText("");
    setFileName("");
    setJobDescription("");
    setRoleTitle("");
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setError("Please upload a resume first or input its raw text.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste a target Job Description to compare.");
      return;
    }
    if (jdValidationError) {
      setError(`Cannot analyze: ${jdValidationError}`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse alignment with Gemini server.");
      }

      setResult(data);
    } catch (err: any) {
      console.error("API analysis error:", err);
      setError(
        err.message || 
        "Failed to reach analysis server. Please verify you have configured your GEMINI_API_KEY inside the Secrets panel."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased transition-colors duration-200">
      {/* Top Professional Header Bar (Standard SaaS layout - print:hidden) */}
      <header className="bg-white border-b border-slate-100 py-3.5 px-6 shrink-0 print:hidden sticky top-0 z-50 shadow-xs backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold tracking-tight shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5 fill-indigo-200" />
            </div>
            <div>
              <h1 className="text-base font-black font-sans tracking-tight text-slate-900 leading-tight">AI Resume Analyzer</h1>
              <p className="text-[10px] text-slate-400 font-medium font-sans uppercase tracking-widest">ATS Match Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLoadDemo}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 rounded-lg active:scale-97 transition-all cursor-pointer"
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              One-Click Demo
            </button>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono font-medium">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>v1.2 Cloud</span>
            </div>

            <button
              type="button"
              onClick={() => setIsDarkMode(prev => !prev)}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Dark Mode Theme"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200 transition-all duration-150 cursor-pointer flex items-center justify-center active:scale-95"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              ) : (
                <Moon className="w-4 h-4 text-slate-500 fill-slate-500/10" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        
        {/* Error Banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-xl flex items-start gap-3 shadow-xs animate-in slide-in-from-top-4 duration-300 print:hidden">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-rose-950 font-sans uppercase tracking-wider">Analysis System Check</h4>
              <p className="text-xs mt-0.5 leading-relaxed font-sans">{error}</p>
              <div className="mt-2 text-[10px] bg-white/70 inline-block px-2.5 py-1 rounded-md text-rose-800 font-mono font-semibold border border-rose-100">
                Tip: If GEMINI_API_KEY is missing, configure it via Settings &gt; Secrets.
              </div>
            </div>
          </div>
        )}

        {/* LOADING ANIMATED OVERVIEW SCREEN */}
        {isLoading ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-xs min-h-[450px] animate-in fade-in duration-300">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full animate-pulse mb-6 relative">
              <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-40"></div>
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 font-sans">Evaluating Applicant Alignment</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Gemini AI in secure server context is mapping criteria overlap, indexing phrasing scores, and tailoring bullet-points.
            </p>

            {/* Stepper indicators */}
            <div className="mt-8 max-w-sm w-full space-y-2.5 bg-slate-50 border border-slate-100 p-4 rounded-xl">
              {loadingSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-left">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    idx < loadingStep 
                      ? "bg-emerald-100 text-emerald-700 font-bold" 
                      : idx === loadingStep 
                      ? "bg-indigo-600 text-white animate-pulse" 
                      : "bg-slate-200 text-slate-400"
                  }`}>
                    {idx < loadingStep ? "✓" : idx + 1}
                  </div>
                  <span className={`text-[11px] truncate font-medium ${
                    idx === loadingStep 
                      ? "text-indigo-900 font-bold" 
                      : idx < loadingStep 
                      ? "text-slate-500 font-mono text-[10px]" 
                      : "text-slate-400"
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Visual bottom progress rail */}
            <div className="w-56 bg-slate-100 h-1 rounded-full overflow-hidden mt-6">
              <div 
                className="bg-indigo-600 h-1 rounded-full transition-all duration-500"
                style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : result ? (
          /* AUDIT RESULTS CONSOLE WORKSPACE */
          <div className="space-y-6 animate-in fade-in duration-500">
            <AnalysisDashboard 
              result={result} 
              roleTitle={roleTitle} 
              onReset={handleClearInputs} 
            />
          </div>
        ) : (
          /* INPUT COLLECTION SCREEN */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Visual Intro Card */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
              <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
                <FileText className="w-full h-full scale-125" />
              </div>
              <div className="max-w-xl relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/20 text-indigo-300 text-[10px] font-bold tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5 fill-indigo-300" />
                  Gemini API Powered
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-sans leading-tight tracking-tight">Evaluate Your ATS Score & Get Personalized Enhancements</h2>
                <p className="text-xs text-indigo-200/90 leading-relaxed font-sans pt-1">
                  Upload your resume in PDF format or paste its content. Provide your target job description, and our AI will audit matched/missing tools, map strengths, flag gaps, and rewrite tailored experiences.
                </p>
                <div className="sm:hidden pt-2">
                  <button
                    onClick={handleLoadDemo}
                    className="flex items-center gap-1.5 w-full justify-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg active:scale-95 transition-all cursor-pointer"
                  >
                    <MousePointerClick className="w-3.5 h-3.5" />
                    Load Demo Data
                  </button>
                </div>
              </div>
            </div>

            {/* Split Input Form Cards */}
            <form onSubmit={handleAnalyze} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: Resume Upload */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Your Resume Content</h3>
                    <p className="text-[11px] text-slate-400">PDF parse or manually type</p>
                  </div>
                </div>

                <ResumeUploader
                  onTextExtracted={handleTextExtracted}
                  extractedText={resumeText}
                  setExtractedText={setResumeText}
                  fileName={fileName}
                />

                {/* Plain-text textarea optional bypass */}
                {!resumeText && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Or paste raw resume text:
                    </label>
                    <textarea
                      value={resumeText}
                      onChange={(e) => {
                        setResumeText(e.target.value);
                        setFileName("Copy_Paste_Resume.txt");
                      }}
                      rows={6}
                      className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400"
                      placeholder="Paste formatting or plain copy of resume here..."
                    />
                  </div>
                )}
              </div>

              {/* Right Column: Job Description paste */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-xs flex flex-col justify-between self-stretch">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Target Role Parameters</h3>
                      <p className="text-[11px] text-slate-400">Specify requirements & job summary</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Target Role Title <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <div className="space-y-2">
                      <div className="relative">
                        <select
                          value={selectValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectValue(val);
                            if (val === "other") {
                              if (ROLE_PRESETS.includes(roleTitle) || roleTitle === "") {
                                setRoleTitle("");
                              }
                            } else {
                              setRoleTitle(val);
                            }
                          }}
                          className="w-full text-xs font-sans pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-slate-700 cursor-pointer appearance-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          <option value="" className="bg-white text-slate-700">-- Select Target Role Preset --</option>
                          {ROLE_PRESETS.map((preset) => (
                            <option key={preset} value={preset} className="bg-white text-slate-700">
                              {preset}
                            </option>
                          ))}
                          <option value="other" className="bg-white text-slate-700">Other (Type manually...)</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <AnimatePresence mode="popLayout">
                        {selectValue === "other" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <input
                              type="text"
                              value={roleTitle}
                              onChange={(e) => setRoleTitle(e.target.value)}
                              placeholder="Type target role manually..."
                              autoComplete="off"
                              className="w-full text-xs font-sans px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400 font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>                  <div className="space-y-1.5 font-sans">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Paste Job Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={8}
                      required
                      className={`w-full text-xs font-sans p-3 rounded-xl focus:outline-none focus:ring-2 placeholder-slate-400 leading-relaxed scrollbar transition-all duration-200 ${
                        jdValidationError 
                          ? "bg-rose-50/20 border border-rose-300 focus:ring-rose-500 focus:border-rose-500 text-slate-800" 
                          : "bg-slate-50 border border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                      }`}
                      placeholder="Paste the full job description or key sections (responsibilities, technical stack, tools)..."
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-400 px-1 font-mono">
                      <span>{jobDescription.length} characters</span>
                      <span>Requires minimum ~50 words</span>
                    </div>

                    <AnimatePresence>
                      {jdValidationError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          className="bg-rose-50 border border-rose-100 text-rose-950 p-3 rounded-xl flex items-start gap-2.5 overflow-hidden"
                        >
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div className="text-[11px] leading-relaxed">
                            <span className="font-bold block text-rose-950 mb-0.5">Fake or Code Input Detected:</span>
                            {jdValidationError}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 mt-4 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={!resumeText.trim() || !jobDescription.trim()}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-white shadow-sm transition-all duration-200 cursor-pointer ${
                      resumeText.trim() && jobDescription.trim()
                        ? "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-200/50 active:scale-98"
                        : "bg-slate-300 cursor-not-allowed text-slate-50"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-indigo-200" />
                    Analyze Resume Alignment
                  </button>
                  { (resumeText || jobDescription) && (
                    <button
                      type="button"
                      onClick={handleClearInputs}
                      className="px-3 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Elegant Minimalist Footer (Standard design alignment) */}
      <footer className="bg-white border-t border-slate-100 py-6 px-6 shrink-0 print:hidden text-center text-xs text-slate-405 font-sans space-y-2 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="text-slate-400">
            &copy; 2026 AI Resume Analyzer. Built securely using server-side Gemini 3.5 AI.
          </div>
        </div>
      </footer>
    </div>
  );
}
