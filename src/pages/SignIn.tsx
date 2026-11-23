import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import SEO from "@/components/SEO.tsx";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import AuthDivider from "@/components/auth/AuthDivider";
import AuthFormField from "@/components/auth/AuthFormField";
import { useAuth } from '../context/AuthContext';
import { useGoogleAuth } from "@/hooks/use-google-auth";
import { ApiError } from "@/api/client.ts";
import { login } from "@/api/auth.ts";
import { createSignInSchema, type SignInFormData } from '@/lib/auth-schema.ts';

interface LocationState {
  from?: Location;
}

export default function SignIn() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState)?.from?.pathname || '/';

  const {
    handleGoogleSuccess,
    handleGoogleError,
    formError,
    setFormError,
  } = useGoogleAuth(from);

  const signInSchema = useMemo(() => createSignInSchema(t), [t]);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: SignInFormData) => {
    setFormError('');
    setServerError('');
    setIsSubmitting(true);
    try {
      const result = await login({ email: data.email, password: data.password });
      setAuth(result.access_token, result.refresh_token, result.user);
      navigate(from, { replace: true });
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'network_error';
      setServerError(t(`authErrors.${code}`));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      {/* Meta tags */}
      <SEO
        title="Sign In"
        description="Sign in to your Aznaoure Art account to view your favorites, make orders, and update your details."
        noindex
      />

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-serif text-2xl sm:text-3xl mb-6 sm:mb-8">
          {t('signIn.title')}
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <AuthFormField
              control={form.control}
              name="email"
              label={t('signIn.email.label')}
              placeholder={t('signIn.email.placeholder')}
              inputMode="email"
              autoComplete="username email"
            />

            <AuthFormField
              control={form.control}
              name="password"
              label={t('signIn.password.label')}
              placeholder={t('signIn.password.placeholder')}
              type="password"
              autoComplete="current-password"
            />

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm underline text-muted-foreground">
                {t('signIn.forgotPassword')}
              </Link>
            </div>

            {(formError || serverError) && (
              <p className="text-sm text-destructive">{formError || serverError}</p>
            )}

            <Button
              type="submit"
              variant="luxury"
              size="lg"
              className="sm:size-xl w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('signIn.submitting') : t('signIn.submit')}
            </Button>
          </form>
        </Form>

        <AuthDivider />

        <GoogleAuthButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />

        <p className="mt-6 text-sm text-muted-foreground">
          {t('signIn.noAccount')}{' '}
          <Link to="/signup" className="underline text-foreground">
            {t('signIn.signUpLink')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}