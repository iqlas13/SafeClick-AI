'use client';

import type { AnyAnalysis, AnalysisClassification } from '@/app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, AlertTriangle, ShieldX, ListChecks, ShieldQuestion, Gauge } from 'lucide-react';
import React from 'react';

interface AnalysisResultProps {
  analysis: AnyAnalysis | null;
  isLoading: boolean;
  analysisType: 'url' | 'email' | 'message';
}

const getBadgeVariant = (classification?: AnalysisClassification): 'success' | 'warning' | 'destructive' | 'secondary' => {
  if (!classification) return 'secondary';
  switch (classification) {
    case 'GENUINE': return 'success';
    case 'SUSPICIOUS': return 'warning';
    case 'SCAM': return 'destructive';
    default: return 'secondary';
  }
};

const getProgressColor = (score: number) => {
  if (score > 70) return 'hsl(var(--destructive))';
  if (score > 40) return 'hsl(var(--warning))';
  return 'hsl(var(--success))';
};

const ResultHeaderIcon = ({ classification }: { classification?: AnalysisClassification }) => {
    switch (classification) {
        case 'GENUINE': return <CheckCircle className="h-8 w-8 text-success" />;
        case 'SUSPICIOUS': return <AlertTriangle className="h-8 w-8 text-warning" />;
        case 'SCAM': return <ShieldX className="h-8 w-8 text-destructive" />;
        default: return <ShieldQuestion className="h-8 w-8 text-muted-foreground" />;
    }
}

const getAnalysisTargetText = (analysis: AnyAnalysis) => {
    if ('url' in analysis && analysis.url) {
        return <code className="font-code text-sm text-primary">{analysis.url}</code>;
    }
    if ('emailContent' in analysis) {
        return 'the provided email.';
    }
    if ('messageContent' in analysis) {
        return 'the provided message.';
    }
    return 'the provided content.';
};


export default function AnalysisResult({ analysis, isLoading, analysisType }: AnalysisResultProps) {
  if (isLoading) {
    return (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
              <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
           <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center p-6 rounded-lg border-2 border-dashed border-border">
        <ShieldQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold font-headline">Awaiting Analysis</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your {analysisType} security analysis will appear here.
        </p>
      </div>
    );
  }
  
  return (
    <div className='h-full'>
      <div className="flex items-start justify-between gap-4">
          <div>
              <h2 className="text-2xl font-bold font-headline">Analysis Complete</h2>
              <p className="text-sm text-muted-foreground">
                  Risk assessment for: {getAnalysisTargetText(analysis)}
              </p>
          </div>
          <ResultHeaderIcon classification={analysis.classification} />
      </div>
      <div className="space-y-6 mt-6">
        <div className="flex items-center justify-between gap-4 rounded-lg border bg-background/50 p-4">
          <h4 className="font-semibold">Classification</h4>
          <Badge variant={getBadgeVariant(analysis.classification)} className="text-sm px-3 py-1">
            {analysis.classification}
          </Badge>
        </div>

        <div>
          <h4 className="mb-2 font-semibold flex items-center gap-2"><Gauge className="w-5 h-5" />Risk Score: {analysis.risk_score}/100</h4>
          <Progress
            value={analysis.risk_score}
            style={{ '--primary': getProgressColor(analysis.risk_score) } as React.CSSProperties}
          />
        </div>
        
        <div>
            <h4 className="mb-3 font-semibold flex items-center gap-2"><ListChecks className="w-5 h-5" />Reasons</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
                {analysis.reasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                      <span>{reason}</span>
                    </li>
                ))}
            </ul>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
            <h4 className="mb-2 font-semibold text-primary flex items-center gap-2"><ShieldX className="w-5 h-5"/>Recommendation</h4>
            <p className="text-sm text-primary/90">{analysis.recommendation}</p>
        </div>

      </div>
    </div>
  );
}
