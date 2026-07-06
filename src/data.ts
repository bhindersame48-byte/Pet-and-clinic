import { 
  Stethoscope, 
  Syringe, 
  ShieldCheck, 
  HeartHandshake, 
  Activity, 
  Utensils, 
  ShoppingBag, 
  Award, 
  Heart,
  Scissors,
  Sparkles,
  Smile
} from 'lucide-react';

import doctorLaibaAvatar from './assets/images/doctor_laiba_avatar_1780986065804.png';
import clinicHeroPets from './assets/images/clinic_hero_pets_1780986048576.png';
import petServicesImg from './assets/images/pet_services_img_1780986084648.png';
import livestockServicesImg from './assets/images/livestock_services_img_1780986107682.png';

export interface CoreValue {
  id: string;
  title: string;
  description: string;
  iconName: 'ShieldCheck' | 'HeartHandshake' | 'Award' | 'Sparkles';
  details: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: 'Stethoscope' | 'Syringe' | 'Heart' | 'Activity' | 'Scissors' | 'Utensils' | 'ShoppingBag';
  category: 'clinical' | 'care' | 'products';
  duration: string;
  highlight: string;
}

export interface Review {
  id: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  comment: string;
  type: 'Pet' | 'Livestock';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Pets' | 'Livestock';
}

export const CLINIC_INFO = {
  name: "Pet & Vet Zone Health Clinic",
  tagline: "Compassionate Care for Every Creature",
  quote: "Every Animal Deserves Love, Care & Respect",
  doctor: {
    name: "Dr. Laiba Tariq",
    degrees: "DVM, RVMP",
    role: "Senior Veterinary Surgeon & Consultant",
    location: "Islamabad / Dunyapur",
    image: doctorLaibaAvatar,
    bio: "Dr. Laiba Tariq is a dedicated Doctor of Veterinary Medicine (DVM) and a Registered Veterinary Medical Practitioner (RVMP). Possessing deep expertise in both companion animal wellness and advanced livestock therapeutics, she bridges the gap between urban high-tech veterinary standards and rural animal health challenges. Dr. Laiba is known for her meticulous surgical skills, precise diagnostic acumen, and her lifelong passion for improving the lives of dogs, cats, birds, cows, sheep, and goats.",
    credentials: [
      "Registered Veterinary Medical Practitioner (RVMP)",
      "Doctor of Veterinary Medicine (DVM) Professional Degree",
      "Specialization in Soft Tissue Surgery & Ruminant Therapeutics",
      "Active Member of Pakistan Veterinary Medical Council"
    ]
  },
  contact: {
    phone: "03287348720",
    phoneDisplay: "+92 328 7348720",
    address: "Dokota Chowk, Near Munshi Khan Hotel, Dunyapur, Pakistan",
    email: "info@petvetzone.example.com",
    hours: [
      { days: "Monday - Friday", times: "09:00 AM - 08:00 PM" },
      { days: "Saturday", times: "10:00 AM - 06:00 PM" },
      { days: "Sunday", times: "Emergency Visits Only" }
    ]
  },
  media: {
    hero: clinicHeroPets,
    pets: petServicesImg,
    livestock: livestockServicesImg
  }
};

export const CORE_VALUES: CoreValue[] = [
  {
    id: "v1",
    title: "Expert Care",
    description: "Equipped with advanced diagnostic techniques and deep veterinary clinical instincts for accurate treatments.",
    iconName: "Award",
    details: "Led by an RVMP certified Doctor, we stay updated with contemporary guidelines for feline, canine, and bovine well-being."
  },
  {
    id: "v2",
    title: "Compassionate Approach",
    description: "Every pet and livestock animal is treated with deep empathy, supreme gentleness, and absolute moral respect.",
    iconName: "HeartHandshake",
    details: "We prioritize reducing diagnostic stress for both animals and their nervous owners alike with gentle handling."
  },
  {
    id: "v3",
    title: "Advanced Treatments",
    description: "Deploying high-quality sterile surgery, target deworming, nutritional balance, and advanced immunizations.",
    iconName: "ShieldCheck",
    details: "State-of-the-art sterile protocols for surgery ensure ultra-safe conditions and minimal complication rates."
  },
  {
    id: "v4",
    title: "Healthy Pets, Happy Families",
    description: "Our ultimate metric of success: smiling households, productive livestock, and happy, energetic companion animals.",
    iconName: "Sparkles",
    details: "Securing livestock milk yields and ensuring a long life for your cats and dogs is what motivates us daily."
  }
];

export const SERVICES: Service[] = [
  {
    id: "s1",
    title: "Consultation",
    description: "Comprehensive physical examinations, diagnostic evaluations, temperature checks, and expert medical advice.",
    iconName: "Stethoscope",
    category: "clinical",
    duration: "15-30 mins Examination",
    highlight: "Primary Diagnostics"
  },
  {
    id: "s2",
    title: "Vaccination",
    description: "Standard core vaccines for puppies, kittens, birds, and regulatory disease vaccination drives for livestock populations.",
    iconName: "Syringe",
    category: "clinical",
    duration: "Quick 10-min Session",
    highlight: "Immunization Safeguard"
  },
  {
    id: "s3",
    title: "Deworming",
    description: "Scientific deworming programs tailored to body-weight calculations for optimal animal growth and feed conversion.",
    iconName: "Activity",
    category: "clinical",
    duration: "On-the-spot dosage",
    highlight: "Parasitology Defense"
  },
  {
    id: "s4",
    title: "Treatment",
    description: "Experienced medical regimens for infectious diseases, digestive upsets, tick-borne disorders, and internal medicine.",
    iconName: "Heart",
    category: "clinical",
    duration: "Custom treatment plan",
    highlight: "Symptom Resolution"
  },
  {
    id: "s5",
    title: "Surgeries",
    description: "Minor and major surgical services including companion neutering, laceration repairs, and bovine dystocia resolution.",
    iconName: "Scissors",
    category: "clinical",
    duration: "Scheduled appointment",
    highlight: "Sterile Surgery Wing"
  },
  {
    id: "s6",
    title: "Nutritional Consultation",
    description: "Carefully balanced feeds formulation, vitamin supplements routines, and dietary plans for companion/farm stock.",
    iconName: "Utensils",
    category: "care",
    duration: "Detailed 25-min session",
    highlight: "Growth & Lactation Balance"
  },
  {
    id: "s7",
    title: "Pet Food & Accessories",
    description: "Availability of highly digestible commercial dog/cat kibbles, dietary supplements, essential medical collars, and pet housing.",
    iconName: "ShoppingBag",
    category: "products",
    duration: "Walk-in collection",
    highlight: "Premium Products"
  }
];

export const TESTIMONIALS: Review[] = [
  {
    id: "r1",
    name: "Muhammad Asif",
    role: "Dairy Farm Owner",
    location: "Dunyapur Rural",
    rating: 5,
    comment: "Dr. Laiba Tariq resolved a critical emergency with three of my high-yield dairy cows. Her diagnostic speed and compassionate handling saved my animals. Truly the finest vet expert in the region!",
    type: "Livestock"
  },
  {
    id: "r2",
    name: "Sara Khan",
    role: "Persian Cat Breeder",
    location: "Islamabad Sector F-10",
    rating: 5,
    comment: "Our entire breeder family trusts Dr. Laiba completely. She handles vaccinations, minor surgeries, and custom nutritional consultations for our kitten litters. She holds supreme veterinary empathy.",
    type: "Pet"
  },
  {
    id: "r3",
    name: "Chaudhary Bashir",
    role: "Livestock Breeder",
    location: "Dokota Area",
    rating: 5,
    comment: "Excellent deworming and vaccination advice! Our sheep stock has shown remarkable growth and health since we started visiting Dr. Laiba Tariq. She is generous, precise, and highly recommended.",
    type: "Livestock"
  },
  {
    id: "r4",
    name: "Zainab Malik",
    role: "Pet Owner (German Shepherd)",
    location: "Dunyapur Town",
    rating: 5,
    comment: "Finding standard clinical expertise for my playful German Shepherd in Dunyapur was tough until Pet & Vet Zone. Dr. Laiba's treatment of a severe viral stomach issue was quick and completely effective.",
    type: "Pet"
  }
];

export const FAQS: FAQItem[] = [
  {
    id: "f1",
    question: "Do you treat both residential pets and farm livestock?",
    answer: "Yes, Dr. Laiba Tariq possesses extensive training and professional licensing (DVM, RVMP) with dual experience in companion pets (dogs, cats, birds, rabbits) and large ruminant livestock (cows, buffaloes, sheep, goats).",
    category: "General"
  },
  {
    id: "f2",
    question: "How often should my puppies and kittens be vaccinated?",
    answer: "Core companion vaccinations should start around 6 to 8 weeks of age and are boosted every 3 to 4 weeks until they reach approximately 16 weeks of age, followed by annual boosters.",
    category: "Pets"
  },
  {
    id: "f3",
    question: "What is the importance of regular livestock deworming?",
    answer: "Parasites can stunt livestock growth, lower milk yield, and cause anemia. Deworming every 3 to 6 months ensures high feed efficiency, perfect immune defense, and peak agricultural productivity.",
    category: "Livestock"
  },
  {
    id: "f4",
    question: "How do I book an emergency surgical appointment?",
    answer: "For emergency cases, please call us directly on 03287348720 immediately. We accommodate walk-ins for severe trauma, but prior calling helps us prep the sterile sterile surgery kit.",
    category: "General"
  },
  {
    id: "f5",
    question: "Can I receive dietary advice for my companion pet’s weight management?",
    answer: "Absolutely. We offer customized nutritional plans corresponding to body-fat scoring, breed susceptibility, activity indexes, and age constraints to ensure a long, energetic life without cardiac hazards.",
    category: "Pets"
  }
];
