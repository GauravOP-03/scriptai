"use client"
import { motion } from "motion/react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PenTool, Bot, Youtube } from "lucide-react"

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
}

const steps = [
    { step: 1, title: "Provide Videos", desc: "Add 3-5 YouTube video links that best represent your style.", icon: Youtube },
    { step: 2, title: "AI Analysis", desc: "Our AI analyzes your tone, vocabulary, and delivery style.", icon: Bot },
    { step: 3, title: "Start Creating", desc: "Generate personalized scripts that match your unique voice.", icon: PenTool },
]

export function HowItWorksGuide() {
    return (
        <motion.div variants={itemVariants}>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="how-it-works">
                    <AccordionTrigger className="font-semibold">How does AI training work?</AccordionTrigger>
                    <AccordionContent className="pt-4">
                        <div className="space-y-6">
                            {steps.map(({ step, title, desc, icon: Icon }) => (
                                <div key={step} className="flex items-start gap-4">
                                    <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 shrink-0">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="pt-0.5">
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </motion.div>
    )
}