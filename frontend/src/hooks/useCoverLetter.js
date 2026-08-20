// frontend/src/hooks/useCoverLetter.js
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { generateCoverLetter } from '@/lib/ai-service';
import {
  coverLettersQueryKey,
  fetchCoverLetters,
  saveCoverLetter,
  deleteCoverLetter,
} from '@/lib/ai-data';

/**
 * Custom hook for cover letter generation and management
 */
export const useCoverLetter = () => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  // Query for fetching saved cover letters
  const { data: letters = [], isLoading: isLoadingLetters } = useQuery({
    queryKey: coverLettersQueryKey,
    queryFn: fetchCoverLetters,
  });

  // Mutation for generating a new cover letter
  const generateMutation = useMutation({
    mutationFn: async ({ company, position, tone, resume, jobDescription }) => {
      const result = await generateCoverLetter({
        company,
        position,
        tone,
        resume,
        jobDescription
      });

      // Save the generated letter
      await saveCoverLetter({
        company,
        position,
        tone,
        content: result.content,
      });

      return result;
    },
    onSuccess: (data) => {
      setContent(data.content);
      toast.success('Cover letter generated successfully!');
      queryClient.invalidateQueries({ queryKey: coverLettersQueryKey });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate cover letter');
    },
  });

  // Mutation for deleting a cover letter
  const deleteMutation = useMutation({
    mutationFn: deleteCoverLetter,
    onSuccess: () => {
      toast.success('Cover letter deleted');
      queryClient.invalidateQueries({ queryKey: coverLettersQueryKey });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete cover letter');
    },
  });

  // Copy to clipboard helper
  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  // Clear current content
  const clearContent = useCallback(() => {
    setContent('');
  }, []);

  // Load a saved letter
  const loadLetter = useCallback((letter) => {
    setContent(letter.content);
  }, []);

  return {
    // State
    content,
    setContent,
    letters,
    isLoadingLetters,
    
    // Mutations
    generate: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    
    // Utilities
    copyToClipboard,
    clearContent,
    loadLetter,
  };
};