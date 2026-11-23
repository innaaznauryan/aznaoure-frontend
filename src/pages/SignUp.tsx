import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { signup } from "@/api/auth.ts";
import { createSignUpSchema, type SignUpFormData } from '@/lib/auth-schema.ts';

export default function SignUp() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

  const {
    handleGoogleSuccess,
    handleGoogleError,
    formError,
    setFormError,
  } = useGoogleAuth();

  const signUpSchema = useMemo(() => createSignUpSchema(t), [t]);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setFormError('');
    setServerError('');
    setIsSubmitting(true);
    try {
      const result = await signup({
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
      });
      setAuth(result.access_token, result.refresh_token, result.user);
      navigate('/', { replace: true });
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
        title="Sign Up"
        description="Create an Aznaoure Art account to save your favorite pieces, place orders, and track their status."
        noindex
      />
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-serif text-2xl sm:text-3xl mb-6 sm:mb-8">
          {t('signUp.title')}
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <AuthFormField
                control={form.control}
                name="firstName"
                label={t('signUp.firstName.label')}
                placeholder={t('signUp.firstName.placeholder')}
              />
              <AuthFormField
                control={form.control}
                name="lastName"
                label={t('signUp.lastName.label')}
                placeholder={t('signUp.lastName.placeholder')}
              />
            </div>

            <AuthFormField
              control={form.control}
              name="email"
              label={t('signUp.email.label')}
              placeholder={t('signUp.email.placeholder')}
              inputMode="email"
              autoComplete="username email"
            />

            <AuthFormField
              control={form.control}
              name="phone"
              label={t('signUp.phone.label')}
              placeholder={t('signUp.phone.placeholder')}
              inputMode="tel"
              autoComplete="tel"
            />

            <AuthFormField
              control={form.control}
              name="password"
              label={t('signUp.password.label')}
              placeholder={t('signUp.password.placeholder')}
              type="password"
              autoComplete="new-password"
            />

            <AuthFormField
              control={form.control}
              name="confirmPassword"
              label={t('signUp.confirmPassword.label')}
              placeholder={t('signUp.confirmPassword.placeholder')}
              type="password"
              autoComplete="new-password"
            />

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
              {isSubmitting ? t('signUp.submitting') : t('signUp.submit')}
            </Button>
          </form>
        </Form>

        <AuthDivider />

        <GoogleAuthButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />

        <p className="mt-6 text-sm text-muted-foreground">
          {t('signUp.haveAccount')}{' '}
          <Link to="/signin" className="underline text-foreground">
            {t('signUp.signInLink')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}