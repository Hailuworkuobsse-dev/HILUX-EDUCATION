import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, UserRound } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  EmptyState,
  Input,
  Skeleton,
  Textarea
} from '@/components/ui';
import { AvailabilityToggle } from '@/features/mentor/components';
import { useMentorProfile, useUpdateMentorProfile } from '@/features/mentor/hooks';
import { mentorProfileSchema, type MentorProfileInput } from '@/features/mentor/schemas';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import { SUBJECTS, LANGUAGES } from '@/lib/constants';

export default function MentorProfilePage() {
  const profile = useMentorProfile();
  const update = useUpdateMentorProfile();
  const toast = useToast();
  const { register, handleSubmit, control, reset, formState: { errors, isDirty } } =
    useForm<MentorProfileInput>({ resolver: zodResolver(mentorProfileSchema) });

  useEffect(() => {
    if (!profile.data) return;
    reset({
      bio: profile.data.bio ?? '',
      subjects: profile.data.subjects,
      yearsOfExperience: profile.data.yearsOfExperience,
      languages: profile.data.languages,
      availability: profile.data.availability
    });
  }, [profile.data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await update.mutate(values);
      toast.success('Profile updated');
      profile.reload();
    } catch (e) {
      toast.error('Update failed', e instanceof ApiError ? e.message : 'Could not update profile.');
    }
  });

  if (profile.loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-40" /><Skeleton className="h-64" /></div>;

  if (profile.error || !profile.data) {
    return <Card className="p-5"><EmptyState icon={<UserRound className="h-6 w-6" />} title={profile.error ? 'Unable to load mentor profile' : 'Mentor profile unavailable'} description={profile.error ? profile.error.message : 'No profile data was returned. Your profile form is not available yet.'} action={<Button variant="secondary" onClick={profile.reload}>Retry</Button>} /></Card>;
  }

  return <div className="space-y-6">
    <PageHeader title="Mentor profile" description="Let students and admins know how you can help." actions={<Button onClick={onSubmit} disabled={!isDirty || update.loading} loading={update.loading} leftIcon={<Save className="h-4 w-4" />}>Save changes</Button>} />
    <form onSubmit={onSubmit} className="space-y-4">
      <Card><CardHeader><CardTitle>Availability</CardTitle></CardHeader><CardContent><Controller control={control} name="availability" render={({ field }) => <AvailabilityToggle value={field.value ?? 'available'} onChange={field.onChange} />} /><p className="mt-2 text-xs text-fg-muted">When offline, students won&apos;t be auto-matched to you.</p></CardContent></Card>
      <Card><CardHeader><CardTitle>About you</CardTitle></CardHeader><CardContent className="space-y-4">
        <Textarea label="Bio" placeholder="Share how you can help, your strengths, and what to expect." rows={4} maxLength={500} error={errors.bio?.message} {...register('bio')} />
        <Input label="Years of experience" type="number" min={0} max={50} error={errors.yearsOfExperience?.message} {...register('yearsOfExperience', { valueAsNumber: true })} />
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Subjects</CardTitle></CardHeader><CardContent><Controller control={control} name="subjects" render={({ field }) => {
        const value = field.value ?? [];
        return <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{SUBJECTS.map((subject) => <Checkbox key={subject} label={subject} checked={value.includes(subject)} onChange={(e) => field.onChange(e.target.checked ? [...value, subject] : value.filter((x) => x !== subject))} />)}</div>;
      }} /></CardContent></Card>
      <Card><CardHeader><CardTitle>Languages</CardTitle></CardHeader><CardContent><Controller control={control} name="languages" render={({ field }) => {
        const value = field.value ?? [];
        const labels: Record<string, string> = { en: 'English', am: 'Amharic', om: 'Afaan Oromo', ti: 'Tigrinya' };
        return <div className="grid gap-2 sm:grid-cols-2">{LANGUAGES.map((language) => <Checkbox key={language} label={labels[language] ?? language} checked={value.includes(language)} onChange={(e) => field.onChange(e.target.checked ? [...value, language] : value.filter((x) => x !== language))} />)}</div>;
      }} /></CardContent></Card>
    </form>
  </div>;
}
