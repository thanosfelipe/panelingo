'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TestimonialCard } from '@/components/ui/testimonial-card';
import { useAuth } from '@/providers/AuthProvider';

const features = [
  {
    title: 'Interactive Exercises',
    description: 'Practice with dynamic exercises that adapt to your learning progress.',
    icon: '📚',
  },
  {
    title: 'Practice Tests',
    description: 'Take full-length practice tests to prepare for the real exam experience.',
    icon: '✍️',
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your improvement with detailed analytics and progress reports.',
    icon: '📊',
  },
] as const;

const testimonials = [
  {
    name: 'Alexia Sevastaki',
    role: 'Student, University of Athens',
    content: 'Panelingo helped me achieve my dream of getting into the University of Athens. The interactive exercises and practice tests were exactly what I needed to prepare effectively.',
    rating: 5,
    image: '/testimonials/maria.jpg',
  },
  {
    name: 'Alexandros Nikolaou',
    role: 'High School Teacher',
    content: 'As a teacher, I recommend Panelingo to all my students. The platform\'s adaptive learning system and comprehensive study materials make it an invaluable resource.',
    rating: 5,
    image: '/testimonials/alexandros.jpg',
  },
  {
    name: 'Elena Dimitriou',
    role: 'Parent',
    content: 'My daughter improved her scores significantly after using Panelingo. The progress tracking feature helped us monitor her improvement and focus on areas that needed more attention.',
    rating: 5,
    image: '/testimonials/elena.jpg',
  },
] as const;

export default function Home() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="space-y-24">
        {/* Hero Section */}
        <section className="relative text-center" aria-labelledby="hero-heading">
          {/* Background gradient */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-indigo-950/50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)]" />
          </div>

          <h1 
            id="hero-heading"
            className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 sm:text-6xl md:text-7xl"
          >
            Master Your Panellinies
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300 sm:text-xl md:mt-8 md:text-2xl">
            Your personalized learning platform for Greek university entrance exams. Practice, learn, and succeed with interactive exercises and comprehensive study materials.
          </p>
          <div className="mt-8 px-4 sm:px-0 max-w-xs sm:max-w-md mx-auto sm:flex sm:justify-center md:mt-12">
            <Button
              asChild
              className="w-full sm:w-auto"
              variant="default"
              size="lg"
            >
              <a href={user ? "/dashboard" : "/auth?mode=signup"} aria-label="Start learning with Panelingo">
                {user ? 'Go to Dashboard' : 'Start Learning'}
              </a>
            </Button>
            <Button
              asChild
              className="mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto"
              variant="outline"
              size="lg"
            >
              <a href="/about" aria-label="Learn more about Panelingo">
                Learn More
              </a>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 
              id="features-heading"
              className="sr-only"
            >
              Features
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:gap-8 mx-auto max-w-xs sm:max-w-none sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card 
                  key={feature.title}
                  className="p-8 group"
                >
                  <div className="text-5xl mb-6 transform transition-transform duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-100 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 relative" aria-labelledby="testimonials-heading">
          {/* Background gradient */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-indigo-950/20 to-gray-900" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 
                id="testimonials-heading"
                className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 sm:text-4xl"
              >
                What Our Users Say
              </h2>
              <p className="mt-4 text-lg text-gray-300">
                Join thousands of successful students who have achieved their goals with Panelingo
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.name}
                  {...testimonial}
                />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button
                variant="outline"
                size="lg"
                className="group"
              >
                Read More Testimonials
                <svg
                  className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
