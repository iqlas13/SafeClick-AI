'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { AlertTriangle, Loader2, ScanLine } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL. e.g. https://google.com' }),
});

interface UrlAnalyzerProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export default function UrlAnalyzer({ onAnalyze, isLoading }: UrlAnalyzerProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAnalyze(values.url);
  }

  return (
    <div>
        <div className="flex items-center gap-2 mb-2">
            <ScanLine className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold font-headline">URL Analyzer</h2>
        </div>
        <p className="text-muted-foreground mb-6">Enter a URL to analyze its potential security risk.</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input className="bg-background/50" placeholder="https://example.com" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col items-start gap-4">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto" variant="default" size="lg">
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <ScanLine className="mr-2 h-4 w-4" />
                )}
                Analyze URL
                </Button>
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                <AlertTriangle className="h-4 w-4 !text-destructive" />
                <AlertTitle className="text-destructive/90">Safety Warning</AlertTitle>
                <AlertDescription className="text-destructive/70">
                    Never enter URLs from unknown or untrusted sources. This tool provides an AI-based assessment but is not a guarantee of safety.
                </AlertDescription>
                </Alert>
            </div>
        </form>
      </Form>
    </div>
  );
}
