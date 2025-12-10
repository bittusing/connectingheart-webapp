import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

type BannerSlide = {
  image: string
  title?: string
  description?: string
}

type DashboardBannerSliderProps = {
  slides: BannerSlide[]
  autoPlayInterval?: number
}

export const DashboardBannerSlider = ({ slides, autoPlayInterval = 6000 }: DashboardBannerSliderProps) => {
  const sanitizedSlides = useMemo(() => slides.filter((slide) => Boolean(slide.image)), [slides])
  const [activeIndex, setActiveIndex] = useState(0)

  const totalSlides = sanitizedSlides.length

  const goTo = useCallback(
    (index: number) => {
      if (!totalSlides) return
      const nextIndex = (index + totalSlides) % totalSlides
      setActiveIndex(nextIndex)
    },
    [totalSlides],
  )

  useEffect(() => {
    if (!totalSlides) return
    const timer = window.setInterval(() => {
      goTo(activeIndex + 1)
    }, autoPlayInterval)

    return () => window.clearInterval(timer)
  }, [activeIndex, autoPlayInterval, goTo, totalSlides])

  if (!totalSlides) {
    return null
  }

  const handlePrev = () => goTo(activeIndex - 1)
  const handleNext = () => goTo(activeIndex + 1)

  return (
    <section
      aria-label="Celebration stories"
      className="relative h-[220px] max-w-full overflow-hidden rounded-[32px] bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 shadow-[0_25px_70px_rgba(67,56,202,0.15)] sm:h-[320px] lg:h-[380px]"
    >
      {sanitizedSlides.map((slide, index) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={index !== activeIndex}
        >
          <img
            src={slide.image}
            alt={slide.title ?? 'Heartfulness celebration'}
            className="h-full w-full object-cover object-center md:object-top"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-transparent" />
        </div>
      ))}

      <div className="relative z-10 flex h-full flex-col justify-center gap-3 px-6 py-10 text-white sm:px-12">
        {sanitizedSlides[activeIndex]?.title && (
          <p className="text-lg font-semibold uppercase tracking-[0.3em] text-slate-50/80">
            {/* {sanitizedSlides[activeIndex].title} */}
          </p>
        )}
        <h3 className="max-w-3xl text-2xl font-bold leading-tight sm:text-3xl">
          {''}
        </h3>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20" />

      {/* <button
        type="button"
        aria-label="Previous slide"
        onClick={handlePrev}
        className="group absolute left-4 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-2 text-slate-900 shadow-lg backdrop-blur transition hover:bg-white"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      <button
        type="button"
        aria-label="Next slide"
        onClick={handleNext}
        className="group absolute right-4 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-2 text-slate-900 shadow-lg backdrop-blur transition hover:bg-white"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button> */}

    </section>
  )
}

