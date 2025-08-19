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

const formSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(255, "Title is too long"),
    description: z.string().min(1, "Description is required"),
    skills: z.array(z.string()).min(1, "At least one skill is required"),
    yearsOfExperience: z.coerce
      .number()
      .min(0, "Years of experience must be 0 or greater")
      .max(50, "Years of experience seems too high"),
    educationDegree: z.enum(["High School", "Bachelor", "Master", "PhD"]),
    educationField: z
      .string()
      .max(100, "Education field is too long")
      .optional(),
    location: z
      .string()
      .min(1, "Location is required")
      .max(100, "Location is too long"),
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
    locationWeight: z.coerce
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
  })
  .refine(
    (data) => {
      const totalWeight =
        data.skillsWeight +
        data.experienceWeight +
        data.educationWeight +
        data.locationWeight;
      return Math.abs(totalWeight - 1) < 0.01; // Allow for small floating point errors
    },
    {
      message: "All weights must sum to 1.00",
      path: ["skillsWeight"],
    },
  );

const CreateJobForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      skills: [],
      yearsOfExperience: 0,
      educationDegree: undefined,
      educationField: "",
      location: "",
      timezone: "",
      skillsWeight: 0.25,
      experienceWeight: 0.25,
      educationWeight: 0.25,
      locationWeight: 0.25,
      interviewsNeeded: 1,
      hiresNeeded: 1,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Convert skills array to string for database storage
    const submitData = {
      ...values,
      skills: values.skills.join(", "),
    };
    // TODO: Implement job creation
    console.log(submitData);
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. New York, NY or Remote"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Job location or remote work arrangement
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
                    <Input placeholder="e.g. EST, PST, GMT+1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Required or preferred timezone
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
              name="locationWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Weight</FormLabel>
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
                    Weight for location/timezone match (0-1)
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

        <Button type="submit" disabled={false}>
          Create Job Posting
          {false && <Loader2 className="ml-1 animate-spin" />}
        </Button>
      </form>
    </Form>
  );
};

export default CreateJobForm;
