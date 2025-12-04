import { create } from 'zustand';

interface TestimonialState {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
}

export const useTestimonialStore = create<TestimonialState>((set) => ({
  currentIndex: 0,
  setCurrentIndex: (index) => set({ currentIndex: index }),
  nextSlide: () => set((state) => ({ 
    currentIndex: (state.currentIndex + 1) % 3 
  })),
  prevSlide: () => set((state) => ({ 
    currentIndex: state.currentIndex === 0 ? 2 : state.currentIndex - 1 
  })),
}));
