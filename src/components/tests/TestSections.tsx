import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TestSectionsProps {
  sections: any[];
}

export default function TestSections({ sections }: TestSectionsProps) {
  return (
    <div className="space-y-6 mt-8">
      {sections.map((section) => (
        <Card key={section._id}>
          <CardHeader>
            <CardTitle>
              {section.name} <span className="text-muted-foreground ml-2">({section.name_hi})</span>
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              Section Order: {section.order} | Time Limit: {section.timeLimit} min
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ minWidth: 220 }}>Question</TableHead>
                  <TableHead style={{ minWidth: 180 }}>Options</TableHead>
                  <TableHead>Correct</TableHead>
                  <TableHead>+ve</TableHead>
                  <TableHead>-ve</TableHead>
                  <TableHead>Multi</TableHead>
                  <TableHead>Image</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.questions.map((q: any) => (
                  <TableRow key={q._id}>
                    <TableCell>
                      <div className="whitespace-pre-line break-words">
                        {q.question}
                        <div className="text-xs text-muted-foreground mt-1">{q.question_hi}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* English Options */}
                      <div className="flex flex-col gap-1">
                        {q.options.map((opt: string, i: number) => (
                          <div key={i} className="text-sm" style={{ fontSize: '13px' }}>
                            <span className="font-semibold mr-1">{String.fromCharCode(65 + i)}.</span> {opt}
                          </div>
                        ))}
                      </div>
                      {/* Hindi Options */}
                      <div className="flex flex-col gap-1 mt-1">
                        {q.options_hi.map((opt: string, i: number) => (
                          <div key={i} className="text-xs text-muted-foreground" style={{ fontSize: '12px' }}>
                            <span className="font-semibold mr-1">{String.fromCharCode(65 + i)}.</span> {opt}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ul className="pl-0">
                        {q.correctAnswers.map((ans: string, i: number) => (
                          <li key={i}>{ans} <span className="text-muted-foreground">({q.correctAnswers_hi[i]})</span></li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell>{q.positiveMarking}</TableCell>
                    <TableCell>{q.negativeMarking}</TableCell>
                    <TableCell>{q.multipleSelection ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      {q.image ? (
                        <a href={q.image} target="_blank" rel="noopener noreferrer">
                          <img src={q.image} alt="Question" className="h-10 w-10 object-contain border rounded" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 