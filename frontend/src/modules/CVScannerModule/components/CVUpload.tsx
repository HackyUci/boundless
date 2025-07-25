"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export const CVUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalBudget, setTotalBudget] = useState<string>("");
  const [monthlyBudget, setMonthlyBudget] = useState<string>("");
  const [budgetUnsure, setBudgetUnsure] = useState<boolean>(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'processing' | 'success'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError(null);

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF or Word document");
      return;
    }

    setFile(selectedFile);
    if (selectedFile.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
    
    setStep('preview');
  };

  const parseNumberString = (value: string): number | null => {
    if (!value) return null;
    const cleanValue = value.replace(/[.,]/g, '');
    const numValue = parseInt(cleanValue);
    return isNaN(numValue) ? null : numValue;
  };

  const handleSubmit = async () => {
    if (!file) return;

    setStep('processing');
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (!budgetUnsure) {
        const totalBudgetValue = parseNumberString(totalBudget);
        const monthlyBudgetValue = parseNumberString(monthlyBudget);
        
        if (totalBudgetValue) {
          formData.append('budget_limit', totalBudgetValue.toString());
        }
        if (monthlyBudgetValue) {
          formData.append('monthly_budget', monthlyBudgetValue.toString());
        }
      }

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 8;
        });
      }, 300);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_AI_URL}/cv/analyze`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setStep('success');
      setIsSuccess(true);
      
      localStorage.setItem('cvAnalysisResult', JSON.stringify(result));
      
      setTimeout(() => {
        router.push("/result");
      }, 2000);

    } catch (err) {
      setError((err as Error).message || "Upload failed. Please try again.");
      setUploadProgress(0);
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReupload = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setStep('upload');
    setTotalBudget("");
    setMonthlyBudget("");
    setBudgetUnsure(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatInputValue = (value: string): string => {
    const cleanValue = value.replace(/[^\d]/g, '');
    if (!cleanValue) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(cleanValue));
  };

  const handleBudgetChange = (value: string, setter: (value: string) => void) => {
    const formatted = formatInputValue(value);
    setter(formatted);
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
          className="hidden"
        />
        
        <div 
          className="w-full max-w-md border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Upload your CV</h3>
          <p className="text-slate-600 mb-2">
            <span className="font-medium text-blue-600">Click to browse</span> or drag and drop
          </p>
          <p className="text-sm text-slate-500">PDF or Word documents (max 10MB)</p>
        </div>
      </div>

      {error && (
        <Alert className="max-w-md mx-auto border-red-200 bg-red-50" variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-8">
      {/* File Preview Section */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{file?.name}</h3>
              <p className="text-sm text-slate-600">{file ? (file.size / 1024).toFixed(2) : 0} KB</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleReupload}
            className="px-4 py-2 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Replace
          </Button>
        </div>

        {preview && (
          <div className="rounded-lg overflow-hidden border border-slate-200 bg-white">
            <iframe
              src={preview}
              className="w-full h-64"
              title="CV Preview"
            />
          </div>
        )}

        {file && !preview && (
          <div className="bg-white rounded-lg p-4 text-center border border-slate-200">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-700 font-medium">Document ready for analysis</p>
            <p className="text-sm text-slate-500">Preview not available for Word documents</p>
          </div>
        )}
      </div>

      {/* Budget Section */}
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Budget Information</h3>
          <p className="text-slate-600">
            Help us find universities that match your financial situation
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Total Study Budget
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 text-sm font-medium">IDR</span>
              </div>
              <Input
                type="text"
                placeholder="500,000,000"
                value={totalBudget}
                onChange={(e) => handleBudgetChange(e.target.value, setTotalBudget)}
                className="pl-12 h-11 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                disabled={budgetUnsure}
              />
            </div>
            <p className="text-xs text-slate-500">
              Estimate budget for tuition, living, and other expenses
            </p>
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Monthly Living Budget
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 text-sm font-medium">IDR</span>
              </div>
              <Input
                type="text"
                placeholder="15,000,000"
                value={monthlyBudget}
                onChange={(e) => handleBudgetChange(e.target.value, setMonthlyBudget)}
                className="pl-12 h-11 border-slate-200 focus:border-orange-400 focus:ring-orange-400/20"
                disabled={budgetUnsure}
              />
            </div>
            <p className="text-xs text-slate-500">
              Monthly expenses for accommodation, food, transport
            </p>
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
          <div className="flex items-start space-x-3">
            <div className="flex items-center h-5">
              <input
                id="budget-unsure"
                type="checkbox"
                checked={budgetUnsure}
                onChange={(e) => setBudgetUnsure(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="budget-unsure" className="font-medium text-slate-800 cursor-pointer">
                I&apos; not sure about my budget
              </label>
              <p className="text-slate-600 mt-1">
                We&apos;ll show you options from budget-friendly to premium universities
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-lg">💡</div>
            <div className="text-sm text-slate-700">
              <span className="font-medium">Pro tip:</span> Budget information helps us prioritize universities with scholarships, 
              work-study programs, and cost-effective locations.
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50" variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          className="px-8 py-3 h-auto text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
        >
          Analyze My CV
        </Button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center space-y-8">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
      
      <div className="space-y-3">
        <h3 className="text-2xl font-semibold text-slate-800">Analyzing Your CV</h3>
        <p className="text-lg text-slate-600 max-w-md mx-auto">
          Our AI is reviewing your background and finding the best university matches.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <Progress value={uploadProgress} className="h-2 mb-4" />
          <p className="text-sm text-slate-600">
            {uploadProgress < 100 
              ? `Processing... ${uploadProgress}%`
              : "Analysis complete! Preparing recommendations..."}
          </p>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      
      <div className="space-y-3">
        <h3 className="text-2xl font-semibold text-slate-800">Analysis Complete!</h3>
        <Alert className="max-w-md mx-auto bg-green-50 border-green-200">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertTitle className="text-green-800 font-medium">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your personalized recommendations are ready. Redirecting now...
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-3">
            {step === 'upload' && "Submit Your CV and Get Recommendations"}
            {step === 'preview' && "Review Your CV and Budget"}
            {step === 'processing' && "Processing Your Application"}
            {step === 'success' && "Ready for Recommendations"}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {step === 'upload' && "We'll analyze your CV and recommend the best universities and majors tailored to your skills and experience."}
            {step === 'preview' && "Please review your uploaded CV and provide budget information to get personalized recommendations."}
            {step === 'processing' && "Please wait while we analyze your profile and find the best matches."}
            {step === 'success' && "Your CV has been successfully analyzed and recommendations are ready!"}
          </p>
        </div>

        {step === 'upload' && renderUploadStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'processing' && renderProcessingStep()}
        {step === 'success' && renderSuccessStep()}
      </div>
    </div>
  );
};