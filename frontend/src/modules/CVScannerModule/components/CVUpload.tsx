"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
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
  };

  const parseNumberString = (value: string): number | null => {
    if (!value) return null;
    const cleanValue = value.replace(/[.,]/g, '');
    const numValue = parseInt(cleanValue);
    return isNaN(numValue) ? null : numValue;
  };

  const handleUpload = async () => {
    if (!file) return;

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
          return prev + 10;
        });
      }, 200);

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

      setIsSuccess(true);
      
      localStorage.setItem('cvAnalysisResult', JSON.stringify(result));
      
      setTimeout(() => {
        router.push("/result");
      }, 1500);

    } catch (err) {
      setError((err as Error).message || "Upload failed. Please try again.");
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setUploadProgress(0);
    setIsSuccess(false);
    setError(null);
    setIsLoading(false);
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Submit Your CV</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            We&apos;ll analyze your CV and recommend the best universities and majors tailored to your skills and experience.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              className="hidden"
              disabled={isLoading}
            />
            
            <div 
              className={`w-full max-w-md border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                isLoading 
                  ? 'border-slate-200 bg-slate-50 cursor-not-allowed' 
                  : 'border-slate-200 hover:border-blue-500 bg-slate-50'
              }`}
              onClick={() => !isLoading && fileInputRef.current?.click()}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                <Upload className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-1">Upload your CV</h3>
              <p className="text-slate-600 mb-2">
                <span className="font-medium text-blue-600">Click to browse</span> or drag and drop
              </p>
              <p className="text-sm text-slate-500">PDF or Word documents (max 10MB)</p>
            </div>
          </div>

          {error && (
            <Alert className="max-w-md mx-auto" variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {file && !error && (
            <Alert className="max-w-md mx-auto">
              <FileText className="w-4 h-4" />
              <AlertDescription className="flex justify-between items-center">
                <span>
                  <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                </span>
                {isSuccess && <CheckCircle className="w-4 h-4 text-green-500" />}
              </AlertDescription>
            </Alert>
          )}

          {preview && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-medium text-slate-800 mb-3">Document Preview</h3>
              <div className="rounded-lg overflow-hidden border border-slate-200">
                <iframe
                  src={preview}
                  className="w-full h-96"
                  title="CV Preview"
                />
              </div>
            </div>
          )}

          {file && !preview && !error && (
            <Alert className="max-w-md mx-auto">
              <FileText className="w-4 h-4" />
              <AlertDescription>
                Document ready for upload. Preview not available for Word documents.
              </AlertDescription>
            </Alert>
          )}

          {uploadProgress > 0 && !error && (
            <div className="max-w-md mx-auto space-y-3">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-center text-sm text-slate-600">
                {uploadProgress < 100 
                  ? `Analyzing your CV... ${uploadProgress}%`
                  : "Analysis complete! Preparing your recommendations..."}
              </p>
            </div>
          )}

          {file && !isSuccess && !error && (
            <div className="space-y-8 pt-6">
              <div className="max-w-3xl mx-auto">
                <div className="border border-gray-200 rounded-lg p-8 bg-white shadow-sm">
                  <div className="space-y-6">
                    <div className="text-center pb-4 border-b border-gray-100">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Budget Information</h3>
                      <p className="text-sm text-gray-600">
                        Help us find universities that match your financial situation
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-900">
                          Total Study Budget
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm font-medium">IDR</span>
                          </div>
                          <Input
                            type="text"
                            placeholder="500,000,000"
                            value={totalBudget}
                            onChange={(e) => handleBudgetChange(e.target.value, setTotalBudget)}
                            className="pl-12 h-11 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                            disabled={isLoading || budgetUnsure}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Estimate budget for tuition, living, and other expenses
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-900">
                          Monthly Living Budget
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm font-medium">IDR</span>
                          </div>
                          <Input
                            type="text"
                            placeholder="15,000,000"
                            value={monthlyBudget}
                            onChange={(e) => handleBudgetChange(e.target.value, setMonthlyBudget)}
                            className="pl-12 h-11 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                            disabled={isLoading || budgetUnsure}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Monthly expenses for accommodation, food, transport
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center h-5">
                          <input
                            id="budget-unsure"
                            type="checkbox"
                            checked={budgetUnsure}
                            onChange={(e) => setBudgetUnsure(e.target.checked)}
                            className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                            disabled={isLoading}
                          />
                        </div>
                        <div className="text-sm">
                          <label htmlFor="budget-unsure" className="font-medium text-gray-900 cursor-pointer">
                            I&apos;m not sure about my budget
                          </label>
                          <p className="text-gray-500 text-xs mt-1">
                            We&apos;ll show you a range of options from budget-friendly to premium universities
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start space-x-2">
                        <div className="text-gray-600 text-sm">💡</div>
                        <div className="text-xs text-gray-700 leading-relaxed">
                          <span className="font-medium">Pro tip:</span> Budget information helps us prioritize universities with scholarships, 
                          work-study programs, and cost-effective locations that match your financial goals.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={isLoading}
                  className="px-8 h-11 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="px-8 h-11 bg-gray-900 hover:bg-gray-800 text-white"
                >
                  {isLoading ? "Processing..." : "Submit CV"}
                </Button>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="text-center pt-4">
              <Alert className="max-w-md mx-auto bg-green-50 border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertTitle className="text-green-800 font-medium">
                  Successfully analyzed your CV!
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  Redirecting to your personalized recommendations...
                </AlertDescription>
                </Alert>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};