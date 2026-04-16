import { DailyReflectionResponse, ReflectionQuestion } from '../types';
import { getAnswerForQuestion, getNumericAnswerValue } from '../lib/reflections';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface ReflectionGraphsProps {
  questions: ReflectionQuestion[];
  responses: DailyReflectionResponse[];
  onCustomize: () => void;
}

function getRecentResponses(responses: DailyReflectionResponse[], days = 14) {
  return responses.slice(-days);
}

function getQuestionPoints(question: ReflectionQuestion, responses: DailyReflectionResponse[]) {
  return getRecentResponses(responses)
    .map((response) => {
      const answer = getAnswerForQuestion(response, question.id);
      return {
        date: response.date,
        numericValue: getNumericAnswerValue(question, answer),
        selectedColor: answer?.selectedColor ?? null,
      };
    })
    .filter((point) => point.numericValue !== null || point.selectedColor);
}

function renderLinePath(points: number[], width: number, height: number) {
  if (!points.length) return '';
  const max = Math.max(...points, 1);
  const stepX = points.length === 1 ? 0 : width / (points.length - 1);

  return points
    .map((point, index) => {
      const x = index * stepX;
      const y = height - (point / max) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

function NormalQuestionChart({
  question,
  responses,
}: {
  question: ReflectionQuestion;
  responses: DailyReflectionResponse[];
}) {
  const points = getQuestionPoints(question, responses).filter(
    (point): point is { date: string; numericValue: number; selectedColor: string | null } =>
      point.numericValue !== null,
  );

  if (!points.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--text-secondary)]">
        No responses yet for this question.
      </div>
    );
  }

  const chartWidth = 420;
  const chartHeight = 140;
  const numericValues = points.map((point) => point.numericValue);
  const max = Math.max(...numericValues, 1);
  const linePath = renderLinePath(numericValues, chartWidth, chartHeight);

  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface-secondary)_80%,transparent)] p-4">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight + 26}`}
        className="h-[180px] w-full"
        preserveAspectRatio="none"
      >
        {question.graphType === 'bar'
          ? points.map((point, index) => {
              const barWidth = chartWidth / points.length - 10;
              const x = index * (chartWidth / points.length) + 5;
              const barHeight = (point.numericValue / max) * chartHeight;
              return (
                <g key={point.date}>
                  <rect
                    x={x}
                    y={chartHeight - barHeight}
                    width={barWidth}
                    height={barHeight}
                    rx={12}
                    fill={question.defaultColor ?? '#60A5FA'}
                  />
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 18}
                    fill="var(--text-muted)"
                    fontSize="11"
                    textAnchor="middle"
                  >
                    {point.date.slice(5)}
                  </text>
                </g>
              );
            })
          : (
            <>
              <path
                d={linePath}
                fill="none"
                stroke={question.defaultColor ?? '#60A5FA'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((point, index) => {
                const stepX = points.length === 1 ? 0 : chartWidth / (points.length - 1);
                const x = index * stepX;
                const y = chartHeight - (point.numericValue / max) * chartHeight;
                return (
                  <g key={point.date}>
                    <circle cx={x} cy={y} r="5" fill={question.defaultColor ?? '#60A5FA'} />
                    <text
                      x={x}
                      y={chartHeight + 18}
                      fill="var(--text-muted)"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      {point.date.slice(5)}
                    </text>
                  </g>
                );
              })}
            </>
          )}
      </svg>
    </div>
  );
}

function ColorSelectChart({
  question,
  responses,
}: {
  question: ReflectionQuestion;
  responses: DailyReflectionResponse[];
}) {
  const points = getQuestionPoints(question, responses).filter((point) => point.selectedColor);

  if (!points.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--text-secondary)]">
        No color selections saved yet.
      </div>
    );
  }

  const width = 420;
  const stepX = points.length === 1 ? 0 : width / Math.max(points.length - 1, 1);

  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface-secondary)_80%,transparent)] p-4">
      <svg viewBox={`0 0 ${width} 120`} className="h-[160px] w-full" preserveAspectRatio="none">
        <line x1="0" y1="40" x2={width} y2="40" stroke="var(--border-strong)" strokeWidth="2" />
        {points.map((point, index) => {
          const x = index * stepX;
          return (
            <g key={point.date}>
              <circle cx={x} cy="40" r="11" fill={point.selectedColor ?? '#60A5FA'} />
              <text x={x} y="82" fill="var(--text-muted)" fontSize="11" textAnchor="middle">
                {point.date.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function ReflectionGraphs({ questions, responses, onCustomize }: ReflectionGraphsProps) {
  const graphableQuestions = questions.filter((question) => question.type !== 'text');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Reflection graphs
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
            Trends from your custom check-ins
          </h3>
        </div>
        <Button variant="ghost" onClick={onCustomize}>
          Manage questions
        </Button>
      </div>

      {!graphableQuestions.length ? (
        <Card className="rounded-[28px] p-5 text-sm text-[var(--text-secondary)]">
          Add a number, rating, yes/no, multi-select, or color-select question to start seeing
          graphs here.
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {graphableQuestions.map((question) => (
            <Card key={question.id} className="rounded-[28px] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                {question.graphType} chart
              </p>
              <h4 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                {question.questionText}
              </h4>
              <div className="mt-5">
                {question.type === 'color_select' ? (
                  <ColorSelectChart question={question} responses={responses} />
                ) : (
                  <NormalQuestionChart question={question} responses={responses} />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
