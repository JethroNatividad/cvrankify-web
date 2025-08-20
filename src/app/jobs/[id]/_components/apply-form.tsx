"use client";

import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/app/_components/ui/form";
import { Input } from "~/app/_components/ui/input";
import { Button } from "~/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Loader2, Send, CheckCircle } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  email: z
    .string()
    .email("Valid email is required")
    .max(255, "Email is too long"),
  resumeFile: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Please select a resume file")
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB",
    )
    .refine(
      (file) =>
        [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
        ].includes(file.type),
      "Only PDF, DOC, DOCX, and TXT files are allowed",
    ),
});

type FormData = z.infer<typeof formSchema>;

interface ApplyFormProps {
  jobId: number;
  jobTitle: string;
}

export function ApplyForm({ jobId, jobTitle }: ApplyFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const applyMutation = api.applicant.applyJob.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Application submitted successfully!");
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to submit application");
    },
  });

  const generateResumeFilename = (fileName: string, applicantName: string) => {
    const timestamp = new Date().getFullYear();
    const sanitizedName = applicantName.toLowerCase().replace(/\s+/g, "-");
    const extension = fileName.includes(".")
      ? fileName.split(".").pop()
      : "pdf";
    return `resumes/${timestamp}/${sanitizedName}-resume.${extension}`;
  };

  const onSubmit = (data: FormData) => {
    if (!data.resumeFile) {
      toast.error("Please select a resume file");
      return;
    }

    // Generate a fake MinIO path based on the pattern in seed.ts
    const resumePath = generateResumeFilename(data.resumeFile.name, data.name);

    applyMutation.mutate({
      jobId,
      name: data.name,
      email: data.email,
      resume: resumePath,
    });
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-green-700">
                Application Submitted!
              </h3>
              <p className="text-muted-foreground">
                Thank you for applying to {jobTitle}. We&apos;ll review your
                application and get back to you soon.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsSubmitted(false)}
              className="mt-4"
            >
              Submit Another Application
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Apply for {jobTitle}
        </CardTitle>
        <CardDescription>
          Fill out the form below to submit your application. All fields are
          required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      {...field}
                      disabled={applyMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      {...field}
                      disabled={applyMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    We&apos;ll use this email to contact you about your
                    application.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resumeFile"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Resume Upload</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                        }
                      }}
                      disabled={applyMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload your resume in PDF, DOC, DOCX, or TXT format (max
                    5MB).
                    {value && (
                      <span className="ml-2 text-xs font-medium">
                        Selected: {value.name}
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={applyMutation.isPending}
              className="w-full"
              size="lg"
            >
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
