import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface TestPreviewProps {
  test: any;
  onDownloadPDF: () => void;
  onStatusToggle: () => void;
  isStatusUpdating: boolean;
  imagesLoading: boolean;
}

export default function TestPreview({
  test,
  onDownloadPDF,
  onStatusToggle,
  isStatusUpdating,
  imagesLoading,
}: TestPreviewProps) {
  const [imageBase64Map, setImageBase64Map] = useState<Record<string, string>>({});

  // Convert images to base64
  useEffect(() => {
    if (!test) return;

    const convertImagesToBase64 = async () => {
      const imageMap: Record<string, string> = {};
      const imagePromises: Promise<void>[] = [];

      test.sections.forEach((section: any) => {
        section.questions.forEach((question: any) => {
          if (question.image) {
            const promise = (async () => {
              try {
                const response = await fetch(question.image, {
                  method: 'GET',
                  mode: 'cors',
                  headers: {
                    'Accept': 'image/*',
                    'Access-Control-Allow-Origin': '*',
                  }
                });
                const blob = await response.blob();
                const reader = new FileReader();
                
                await new Promise<void>((resolve) => {
                  reader.onloadend = () => {
                    imageMap[question._id] = reader.result as string;
                    resolve();
                  };
                  reader.readAsDataURL(blob);
                });
              } catch (err) {
                console.error('Error converting image to base64:', err);
                // If fetch fails, try to use the image URL directly
                imageMap[question._id] = question.image;
              }
            })();
            imagePromises.push(promise);
          }
        });
      });

      await Promise.all(imagePromises);
      setImageBase64Map(imageMap);
    };

    convertImagesToBase64();
  }, [test]);

  if (!test) return null;

  return (
    <div id="test-paper" className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold mb-2">{test.title}</h1>
        <p className="text-lg text-gray-600">{test.title_hi}</p>
        <div className="mt-4 text-sm text-gray-500">
          <p>Duration: {Math.floor(test.durationInMinutes / 60)} minutes</p>
          <p>Total Marks: {test.totalMarks}</p>
        </div>
      </div>

      {/* Sections */}
      {test.sections.map((section: any, sectionIndex: number) => (
        <div key={section._id} className="mb-8">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h2 className="text-xl font-semibold">
              Section {sectionIndex + 1}: {section.name}
            </h2>
            <p className="text-gray-600">{section.name_hi}</p>
            {section.timeLimit && (
              <p className="text-sm text-gray-500 mt-1">
                Time Limit: {section.timeLimit} minutes
              </p>
            )}
          </div>

          {/* Questions */}
          {section.questions.map((question: any, qIndex: number) => (
            <div key={question._id} className="mb-8 p-4 border rounded-lg">
              <div className="mb-4">
                <p className="text-lg font-medium mb-2">
                  {qIndex + 1}. {question.question}
                </p>
                <p className="text-gray-600">{question.question_hi}</p>
              </div>

              {/* Question Image */}
              {question.image && (
                <div className="flex justify-center my-4">
                  {imageBase64Map[question._id] ? (
                    <img
                      src={imageBase64Map[question._id]}
                      alt="Question"
                      className="max-h-64 object-contain rounded"
                    />
                  ) : (
                    <div className="h-64 w-full flex items-center justify-center bg-gray-100 rounded">
                      <Loader2 className="animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-2 gap-8">
                {/* English Options */}
                <div>
                  <h3 className="font-medium mb-2">Options (English)</h3>
                  <div className="space-y-2">
                    {question.options.map((option: string, optIndex: number) => (
                      <div
                        key={optIndex}
                        className={`p-2 rounded ${
                          question.correctAnswers.includes(option)
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        {option}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hindi Options */}
                <div>
                  <h3 className="font-medium mb-2">Options (Hindi)</h3>
                  <div className="space-y-2">
                    {question.options_hi.map((option: string, optIndex: number) => (
                      <div
                        key={optIndex}
                        className={`p-2 rounded ${
                          question.correctAnswers_hi.includes(option)
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
} 