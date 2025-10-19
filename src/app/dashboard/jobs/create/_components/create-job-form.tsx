"use client";

import React from "react";
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
import { TagsInput } from "~/app/_components/ui/tags-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/app/_components/ui/select";
import { Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(255, "Title is too long"),
    description: z.string().min(1, "Description is required"),
    skills: z.array(z.string()).min(1, "At least one skill is required"),
    yearsOfExperience: z.coerce
      .number()
      .min(0, "Years of experience must be 0 or greater")
      .max(50, "Years of experience seems too high"),
    educationDegree: z.enum(["None", "High School", "Bachelor", "Master", "PhD"]),
    educationField: z
      .string()
      .max(100, "Education field is too long")
      .optional(),
    timezone: z
      .string()
      .min(1, "Timezone is required")
      .max(100, "Timezone is too long"),
    skillsWeight: z.coerce
      .number()
      .min(0)
      .max(1, "Weight must be between 0 and 1"),
    experienceWeight: z.coerce
      .number()
      .min(0)
      .max(1, "Weight must be between 0 and 1"),
    educationWeight: z.coerce
      .number()
      .min(0)
      .max(1, "Weight must be between 0 and 1"),
    timezoneWeight: z.coerce
      .number()
      .min(0)
      .max(1, "Weight must be between 0 and 1"),
    interviewsNeeded: z.coerce
      .number()
      .min(1, "At least 1 interview is needed")
      .max(10, "Too many interviews"),
    hiresNeeded: z.coerce
      .number()
      .min(1, "At least 1 hire is needed")
      .max(50, "Too many hires"),
    // New required fields
    employmentType: z.enum(["Full-time", "Part-time", "Contract", "Internship"]),
    workplaceType: z.enum(["Remote", "Hybrid", "On-site"]),
    location: z.string().min(1, "Location is required").max(255, "Location is too long"),
    qualifications: z.string().min(1, "Qualifications are required"),
    // New optional fields
    preferredQualifications: z.string().optional(),
    industry: z.string().max(100, "Industry is too long").optional(),
    jobFunction: z.string().max(100, "Job function is too long").optional(),
    benefits: z.string().optional(),
    salaryRange: z.string().max(100, "Salary range is too long").optional(),
  })
  .refine(
    (data) => {
      const totalWeight =
        data.skillsWeight +
        data.experienceWeight +
        data.educationWeight +
        data.timezoneWeight;
      return Math.abs(totalWeight - 1) < 0.01; // Allow for small floating point errors
    },
    {
      message: "All weights must sum to 1.00",
      path: ["skillsWeight"],
    },
  );

const CreateJobForm = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      skills: [],
      yearsOfExperience: 0,
      educationDegree: "High School",
      educationField: "",
      timezone: "",
      skillsWeight: 0.4,
      experienceWeight: 0.3,
      educationWeight: 0.2,
      timezoneWeight: 0.1,
      interviewsNeeded: 1,
      hiresNeeded: 1,
      employmentType: "Full-time",
      workplaceType: "Remote",
      location: "",
      qualifications: "",
      preferredQualifications: "",
      industry: "",
      jobFunction: "",
      benefits: "",
      salaryRange: "",
    },
  });

  const createJob = api.job.create.useMutation({
    onSuccess: () => {
      toast.success("Job created successfully!");
      router.push("/dashboard/");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Convert skills array to string for database storage
    const submitData = {
      ...values,
      skills: values.skills.join(", "),
    };

    await createJob.mutateAsync(submitData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Job Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Job Information</h3>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Senior Frontend Developer"
                    {...field}
                  />
                </FormControl>
                <FormDescription>The title of the job position</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Description</FormLabel>
                <FormControl>
                  <textarea
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe the job responsibilities, requirements, and what you're looking for in a candidate..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Detailed description of the job role and responsibilities
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Skills</FormLabel>
                <FormControl>
                  <TagsInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Type a skill and press Enter (e.g. React, TypeScript, Node.js...)"
                  />
                </FormControl>
                <FormDescription>
                  Type skills and press Enter or comma to add them. Click X to
                  remove.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>Type of employment</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workplaceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workplace Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select workplace type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="On-site">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>Work arrangement</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Remote - Philippines"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Job location or region</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="qualifications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Qualifications / Requirements</FormLabel>
                <FormControl>
                  <textarea
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="List required qualifications, skills, tools, education requirements..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Required skills, tools, education, and other qualifications
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferredQualifications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Qualifications (Optional)</FormLabel>
                <FormControl>
                  <textarea
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="List bonus skills, certifications, or nice-to-have qualifications..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Bonus skills and qualifications that would be advantageous
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Information Technology, Healthcare"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Industry sector</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobFunction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Function (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Engineering, Development, QA"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Primary job function</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="benefits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Benefits (Optional)</FormLabel>
                <FormControl>
                  <textarea
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="List benefits such as health insurance, flexible hours, PTO, etc..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Benefits and perks offered with this position
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salaryRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Range (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., $50,000 - $70,000 annually or Not disclosed"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Salary range or indicate if not disclosed
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="yearsOfExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="3" {...field} />
                  </FormControl>
                  <FormDescription>
                    Minimum years of relevant experience
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GMT-12">
                          GMT-12 (Baker Island)
                        </SelectItem>
                        <SelectItem value="GMT-11">
                          GMT-11 (American Samoa)
                        </SelectItem>
                        <SelectItem value="GMT-10">GMT-10 (Hawaii)</SelectItem>
                        <SelectItem value="GMT-9">GMT-9 (Alaska)</SelectItem>
                        <SelectItem value="GMT-8">
                          GMT-8 (Pacific Time)
                        </SelectItem>
                        <SelectItem value="GMT-7">
                          GMT-7 (Mountain Time)
                        </SelectItem>
                        <SelectItem value="GMT-6">
                          GMT-6 (Central Time)
                        </SelectItem>
                        <SelectItem value="GMT-5">
                          GMT-5 (Eastern Time)
                        </SelectItem>
                        <SelectItem value="GMT-4">
                          GMT-4 (Atlantic Time)
                        </SelectItem>
                        <SelectItem value="GMT-3">
                          GMT-3 (Argentina, Brazil)
                        </SelectItem>
                        <SelectItem value="GMT-2">
                          GMT-2 (Mid-Atlantic)
                        </SelectItem>
                        <SelectItem value="GMT-1">GMT-1 (Azores)</SelectItem>
                        <SelectItem value="GMT+0">
                          GMT+0 (London, Dublin)
                        </SelectItem>
                        <SelectItem value="GMT+1">
                          GMT+1 (Paris, Berlin)
                        </SelectItem>
                        <SelectItem value="GMT+2">
                          GMT+2 (Cairo, Athens)
                        </SelectItem>
                        <SelectItem value="GMT+3">
                          GMT+3 (Moscow, Istanbul)
                        </SelectItem>
                        <SelectItem value="GMT+4">
                          GMT+4 (Dubai, Baku)
                        </SelectItem>
                        <SelectItem value="GMT+5">
                          GMT+5 (Pakistan, Kazakhstan)
                        </SelectItem>
                        <SelectItem value="GMT+5:30">
                          GMT+5:30 (India, Sri Lanka)
                        </SelectItem>
                        <SelectItem value="GMT+6">
                          GMT+6 (Bangladesh, Kyrgyzstan)
                        </SelectItem>
                        <SelectItem value="GMT+7">
                          GMT+7 (Thailand, Vietnam)
                        </SelectItem>
                        <SelectItem value="GMT+8">
                          GMT+8 (China, Singapore)
                        </SelectItem>
                        <SelectItem value="GMT+9">
                          GMT+9 (Japan, South Korea)
                        </SelectItem>
                        <SelectItem value="GMT+10">
                          GMT+10 (Australia East)
                        </SelectItem>
                        <SelectItem value="GMT+11">
                          GMT+11 (Solomon Islands)
                        </SelectItem>
                        <SelectItem value="GMT+12">
                          GMT+12 (New Zealand)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Required or preferred timezone
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="educationDegree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education Degree</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select degree level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="High School">High School</SelectItem>
                        <SelectItem value="Bachelor">
                          Bachelor&apos;s Degree
                        </SelectItem>
                        <SelectItem value="Master">
                          Master&apos;s Degree
                        </SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Required minimum education level
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="educationField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education Field</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Computer Science, Engineering, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Required or preferred field of study (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Scoring Weights */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Evaluation Criteria Weights</h3>
          <p className="text-muted-foreground text-sm">
            Set the importance of each criteria in candidate evaluation. All
            weights must sum to 1.00.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Current Sum:</span>
            <span 
              className={`font-mono ${
                Math.abs(
                  Number(form.watch('skillsWeight')) + 
                  Number(form.watch('experienceWeight')) + 
                  Number(form.watch('educationWeight')) + 
                  Number(form.watch('timezoneWeight')) - 1
                ) < 0.01 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {(
                Number(form.watch('skillsWeight')) + 
                Number(form.watch('experienceWeight')) + 
                Number(form.watch('educationWeight')) + 
                Number(form.watch('timezoneWeight'))
              ).toFixed(2)}
            </span>
            <span className="text-muted-foreground">/ 1.00</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="skillsWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills Weight</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      placeholder="0.25"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Weight for technical skills evaluation (0-1)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experienceWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Weight</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      placeholder="0.25"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Weight for experience evaluation (0-1)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="educationWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education Weight</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      placeholder="0.25"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Weight for education evaluation (0-1)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezoneWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone Weight</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      placeholder="0.25"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Weight for timezone match (0-1)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Hiring Process */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Hiring Process</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="interviewsNeeded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Rounds Needed</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of interview rounds required
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hiresNeeded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Hires Needed</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      placeholder="1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Total number of people to hire for this role
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={createJob.isPending}>
          Create Job Posting
          {createJob.isPending && <Loader2 className="ml-1 animate-spin" />}
        </Button>
      </form>
    </Form>
  );
};

export default CreateJobForm;
