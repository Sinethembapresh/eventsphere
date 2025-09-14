"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export default function FAQsPage() {
  const faqs = [
    {
      question: "How do I register for an event?",
      answer:
        "Go to the 'Upcoming Events' section, select the event you’re interested in, and click the 'Register' button. You may need to log in first.",
    },
    {
      question: "Can I participate in multiple events?",
      answer:
        "Yes! You can register for and participate in multiple events as long as they don’t overlap in schedule.",
    },
    {
      question: "Will I receive a certificate for participation?",
      answer:
        "Yes, certificates will be available under the 'Certificates' section once the event is completed and verified.",
    },
    {
      question: "Is there a fee to attend events?",
      answer:
        "Most events are free, but some may have a nominal fee. Fees (if any) are displayed on the event details page.",
    },
    {
      question: "How do I verify the authenticity of my certificate?",
      answer:
        "Each certificate comes with a unique verification code. You can verify it in the 'Certificates' section.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 text-lg">
            Here are answers to some of the most common questions about EventSphere.
          </p>
        </div>

        {/* Accordion FAQs */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger className="text-lg font-semibold text-gray-800">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
