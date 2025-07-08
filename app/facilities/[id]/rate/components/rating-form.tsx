"use client";
import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// 1. Updated and simplified form schema
const formSchema = z.object({
  score: z.number().min(1, "Rating is required.").max(5),
  comment: z.string().min(1, "Comment is required.").max(500, "Comment cannot exceed 500 characters."),
});

export function RatingForm({ facilityId }: { facilityId: string }) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      score: 0,
      comment: '',
    },
  });

  // 2. Implemented the onSubmit function
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Get the current logged-in user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        toast({ title: "Error", description: "You must be logged in to leave a review.", variant: "destructive" });
        return;
      }
      
      const reviewData = {
        facility_id: facilityId,
        user_id: user.id,
        score: values.score,
        comment: values.comment,
      };

      const { error } = await supabase.from('facility_reviews').insert(reviewData);

      if (error) {
        throw error;
      }

      toast({ title: "Success!", description: "Your review has been submitted." });
      // Redirect back to the facility page to see the new review
      router.push(`/facilities/${facilityId}`);
      router.refresh(); // Refresh the page to show the new data

    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Could not submit your review. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    // 3. Simplified the form JSX
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <select
          {...form.register("score", { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={0} disabled>Select a rating</option>
          <option value={5}>⭐⭐⭐⭐⭐ (Excellent)</option>
          <option value={4}>⭐⭐⭐⭐ (Great)</option>
          <option value={3}>⭐⭐⭐ (Good)</option>
          <option value={2}>⭐⭐ (Fair)</option>
          <option value={1}>⭐ (Poor)</option>
        </select>
        {form.formState.errors.score && <p className="text-red-600 text-sm mt-1">{form.formState.errors.score.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
        <textarea
          {...form.register("comment")}
          placeholder="Share your experience..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        ></textarea>
        {form.formState.errors.comment && <p className="text-red-600 text-sm mt-1">{form.formState.errors.comment.message}</p>}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
