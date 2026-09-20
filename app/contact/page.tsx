'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import JsonLd from '@/components/seo/JsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import LocalBusinessJsonLd from '@/components/seo/LocalBusinessJsonLd';
import FAQJsonLd from '@/components/seo/FAQJsonLd';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().min(2, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

const contactInfo = {
  address: '123 Botanical Lane, Green Valley, CA 90210',
  phone: '+1 (555) 123-4567',
  email: 'hello@glowteva.com',
  workingHours: [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ],
  socialLinks: [
    { name: 'Instagram', href: 'https://instagram.com/glowteva', icon: 'instagram' },
    { name: 'Facebook', href: 'https://facebook.com/glowteva', icon: 'facebook' },
    { name: 'Twitter', href: 'https://twitter.com/glowteva', icon: 'twitter' },
    { name: 'Pinterest', href: 'https://pinterest.com/glowteva', icon: 'pinterest' },
  ],
};

const mapUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.123456789!2d-118.2437!3d34.0522!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c75ddc27da13%3A0xe22fdf6f254609f4!2s123%20Botanical%20Lane%2C%20Green%20Valley%2C%20CA%2090210!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus';

const starIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#C5A46E" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const halfStarIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#C5A46E" strokeWidth="2"/>
  </svg>
);

const emptyStarIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DED7CC" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const faqs = [
  {
    question: 'Where are you located?',
    answer: 'GlowTeva Organics is located at 123 Botanical Lane, Green Valley, CA 90210. Our flagship store carries our full range of organic skincare products.',
  },
  {
    question: 'What areas do you ship to?',
    answer: 'We currently deliver within Pakistan. Delivery options and times are shown at checkout based on your address.',
  },
  {
    question: 'What are your opening hours?',
    answer: 'Monday through Friday, 9:00 AM to 6:00 PM. Saturday, 10:00 AM to 4:00 PM. We are closed on Sundays.',
  },
  {
    question: 'How can I book or place an order?',
    answer: 'You can browse our collection at /shop, add products to your cart, and proceed to checkout. No appointment is needed for online orders.',
  },
  {
    question: 'How can I contact you?',
    answer: 'You can reach us at hello@glowteva.com or call us at +1 (555) 123-4567. You can also use the contact form on this page.',
  },
  {
    question: 'Do you offer free shipping?',
    answer: 'Yes, we offer free shipping on orders over $75. A flat shipping rate of $8.50 applies to orders under that amount.',
  },
];

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post<{ message: string }>('/contact', data);
      setStatus('success');
      setMsg(res.message || 'Message received');
      reset();
    } catch (err: any) {
      setStatus('error');
      setMsg(err.message || 'Failed to send');
    }
  };

  const renderRating = () => {
    const fullStars = 4;
    const hasHalf = true;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => <span key={i}>{starIcon}</span>)}
        {hasHalf && <span>{halfStarIcon}</span>}
        {[...Array(emptyStars)].map((_, i) => <span key={i}>{emptyStarIcon}</span>)}
        <span className="ml-2 text-sm font-medium text-forest">4.7</span>
        <span className="text-sm text-soft-green/70">(248 reviews)</span>
      </div>
    );
  };

  const renderWorkingHours = () => (
    <div className="space-y-3">
      {contactInfo.workingHours.map((item, i) => (
        <div key={i} className="flex justify-between items-center py-2 border-b border-soft-border/50 last:border-0">
          <span className="text-sm text-soft-green">{item.day}</span>
          <span className="text-sm font-medium text-dark-text">{item.hours}</span>
        </div>
      ))}
    </div>
  );

  const renderContactItem = (icon: React.ReactNode, label: string, value: string, href?: string) => (
    <div className="flex gap-4">
      <div className="w-12 h-12 rounded-lg bg-forest/5 flex items-center justify-center flex-shrink-0">
        <span className="text-forest">{icon}</span>
      </div>
      <div>
        <p className="text-xs tracking-[0.1em] uppercase text-soft-green font-medium">{label}</p>
        {href ? (
          <a href={href} className="text-base text-dark-text hover:text-gold transition-colors">{value}</a>
        ) : (
          <p className="text-base text-dark-text">{value}</p>
        )}
      </div>
    </div>
  );

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Contact GlowTeva Organics', url: base, description: 'Get in touch with GlowTeva Organics.' }} />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Contact', url: '/contact' }]} />
      <LocalBusinessJsonLd />
      <FAQJsonLd items={faqs} />
      <div className="pt-28 pb-20">
        <div className="container-luxury">
          <div className="text-center mb-16">
            <p className="eyebrow mb-3">GET IN TOUCH</p>
            <h1 className="heading-section">Contact Us</h1>
            <p className="body-elegant mt-4 max-w-2xl mx-auto">We would love to hear from you. Whether you have a question about our products, need help with an order, or just want to say hello — our team is here for you.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="space-y-8">
              <div className="card-luxury overflow-hidden">
                <div className="aspect-[4/3] w-full">
                  <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="GlowTeva Organics Location" />
                </div>
              </div>

              <div className="card-luxury p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-forest/5 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2C3E2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs tracking-[0.1em] uppercase text-soft-green font-medium">Visit Us</p>
                    <p className="text-base font-medium text-forest">Our Flagship Store</p>
                  </div>
                </div>
                <address className="text-soft-green leading-relaxed not-italic">{contactInfo.address}</address>
              </div>

              <div className="card-luxury p-6 md:p-8">
                <div className="mb-6">
                  <p className="text-xs tracking-[0.1em] uppercase text-soft-green font-medium mb-4">Customer Rating</p>
                  {renderRating()}
                </div>
                <div className="pt-6 border-t border-soft-border/50">
                  <p className="text-xs tracking-[0.1em] uppercase text-soft-green font-medium mb-4">Working Hours</p>
                  {renderWorkingHours()}
                  <div className="mt-4 pt-4 border-t border-soft-border/50">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-soft-green"></span>
                      <span className="text-soft-green">Online now - Typically replies within 2 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:sticky lg:top-28">
              <div className="card-luxury p-6 md:p-8">
                <div className="mb-8">
                  <p className="eyebrow mb-3">SEND A MESSAGE</p>
                  <h2 className="font-serif text-2xl md:text-3xl font-medium tracking-tight text-forest">We&apos;re All Ears</h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  <div>
                    <Label htmlFor="name" className="block mb-2">Name</Label>
                    <Input id="name" {...register('name')} placeholder="Your name" className="input-luxury" aria-invalid={errors.name ? 'true' : 'false'} aria-describedby={errors.name ? 'name-error' : undefined} />
                    {errors.name && <p id="name-error" className="text-red-600 text-xs mt-1" role="alert">{errors.name.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email" className="block mb-2">Email</Label>
                    <Input id="email" type="email" {...register('email')} placeholder="your@email.com" className="input-luxury" aria-invalid={errors.email ? 'true' : 'false'} aria-describedby={errors.email ? 'email-error' : undefined} />
                    {errors.email && <p id="email-error" className="text-red-600 text-xs mt-1" role="alert">{errors.email.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="subject" className="block mb-2">Subject</Label>
                    <Input id="subject" {...register('subject')} placeholder="How can we help?" className="input-luxury" aria-invalid={errors.subject ? 'true' : 'false'} aria-describedby={errors.subject ? 'subject-error' : undefined} />
                    {errors.subject && <p id="subject-error" className="text-red-600 text-xs mt-1" role="alert">{errors.subject.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="message" className="block mb-2">Message</Label>
                    <Textarea id="message" {...register('message')} rows={5} placeholder="Tell us more..." className="input-luxury min-h-[140px] resize-y" aria-invalid={errors.message ? 'true' : 'false'} aria-describedby={errors.message ? 'message-error' : undefined} />
                    {errors.message && <p id="message-error" className="text-red-600 text-xs mt-1" role="alert">{errors.message.message}</p>}
                  </div>

                  {msg && <p className={`text-sm ${status === 'success' ? 'text-soft-green' : 'text-red-600'}`} role="alert" aria-live="polite">{msg}</p>}

                  <Button type="submit" className="w-full py-3.5 text-sm tracking-wide" disabled={isSubmitting} aria-busy={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>

                <div className="mt-8 pt-8 border-t border-soft-border/50">
                  <p className="text-xs tracking-[0.1em] uppercase text-soft-green font-medium mb-4">Follow Our Journey</p>
                  <div className="flex gap-3">
                    {contactInfo.socialLinks.map((social, i) => (
                      <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.name} className="w-10 h-10 rounded-lg border border-soft-border/60 flex items-center justify-center text-forest hover:bg-forest hover:text-cream hover:border-forest transition-all duration-300">
                        {social.icon === 'instagram' && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                          </svg>
                        )}
                        {social.icon === 'facebook' && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                          </svg>
                        )}
                        {social.icon === 'twitter' && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                          </svg>
                        )}
                        {social.icon === 'pinterest' && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="17" x2="12" y2="22"/>
                            <path d="M5 17h14v-2.5a2 2 0 0 0-4 0V17"/>
                            <path d="M12 6a10 10 0 1 0-1 10" />
                          </svg>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-12 border-t border-soft-border/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $75' },
                { icon: '🌿', title: 'Pure Ingredients', desc: '100% botanical formulas' },
                { icon: '🔄', title: 'Easy Returns', desc: '30-day satisfaction guarantee' },
              ].map((item, i) => (
                <div key={i} className="p-6">
                  <span className="text-3xl mb-3 block">{item.icon}</span>
                  <h4 className="font-serif text-lg font-medium text-forest mb-1">{item.title}</h4>
                  <p className="text-sm text-soft-green">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
