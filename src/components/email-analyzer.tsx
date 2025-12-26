'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { AlertTriangle, Loader2, MailWarning } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  emailContent: z.string().min(10, { message: 'Please paste the content of the email.' }),
});

interface EmailAnalyzerProps {
  onAnalyze: (emailContent: string) => void;
  isLoading: boolean;
}

export default function EmailAnalyzer({ onAnalyze, isLoading }: EmailAnalyzerProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailContent: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAnalyze(values.emailContent);
  }

  return (
    <div>
        <div className="flex items-center gap-2 mb-2">
            <MailWarning className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold font-headline">Email Analyzer</h2>
        </div>
        <p className="text-muted-foreground mb-6">Paste an email's content to check for phishing indicators.</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="emailContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Content</FormLabel>
                  <FormControl>
                    <Textarea
                      className="bg-background/50 h-40 font-code text-xs"
                      placeholder="Paste the full email content here..."
                      {...field}
                      disabled={isLoading}
                    />
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
                    <MailWarning className="mr-2 h-4 w-4" />
                )}
                Analyze Email
                </Button>
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                <AlertTriangle className="h-4 w-4 !text-destructive" />
                <AlertTitle className="text-destructive/90">Privacy Note</AlertTitle>
                <AlertDescription className="text-destructive/70">
                    This tool analyzes content for security threats. Avoid pasting personally identifiable information if possible. All analysis is performed by an AI model.
                </AlertDescription>
                </Alert>
            </div>
        </form>
      </Form>
    </div>
  );
}
