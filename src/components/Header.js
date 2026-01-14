import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import ImageWebp from './ImageWebp'
import CountryWeather from './CountryWeather'
import { applyLocalePrefix } from '../utils/langRouting'
import { useLangRouter } from '../routing/LangRouter'
import { buildPathWithLang } from '../utils/langRouting'

function Header({ handleLanguage, currentLanguage, handleCountry, currentCountry = "Country", onHeightChange }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const { urlLang } = useLangRouter()
  
  // Get current language from URL to sync with dropdowns (for language/country dropdowns)
  const currentLang = urlLang
  
  // Check if we're on the home page (works for all language versions)
  const cleanPath = location.pathname.replace(/^\/(fr|lb)(?=\/|$)/, "")
  const isHome = cleanPath === "/" || cleanPath === ""

  const ASSET = process.env.PUBLIC_URL || ""

  const [showCountry, setshowCountry] = useState(false)
  const [open, setOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const headerRef = useRef(null)

  // Measure header height and notify parent (for content padding)
  useLayoutEffect(() => {
    if (!headerRef.current) return

    const measureHeight = () => {
      if (headerRef.current && onHeightChange) {
        const height = headerRef.current.offsetHeight
        onHeightChange(height)
      }
    }

    // Measure immediately and on resize
    measureHeight()
    const resizeObserver = new ResizeObserver(measureHeight)
    resizeObserver.observe(headerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [onHeightChange, showCountry, open])

  useEffect(() => {
    document.body.classList.toggle("home-page", isHome)
    return () => document.body.classList.remove("home-page")
  }, [isHome])

  // Track scroll to add blur effect to nav bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset
      setIsScrolled(scrollY > 10) // Start blur after 10px scroll
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Check initial scroll position
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const closeAllDropdowns = () => {
    setshowCountry(false)
  }

  // Shared function to apply locale prefix changes (used by both dropdowns)
  const applyLocaleChange = (newCountry, newLanguage) => {
    // Determine the final country and language to use
    const finalCountry = newCountry !== null && newCountry !== undefined ? newCountry : currentCountry
    const finalLanguage = newLanguage !== null && newLanguage !== undefined ? newLanguage : currentLang
    
    // If country changed, try to sync language (France → French, Lebanon → Arabic)
    let syncedLanguage = finalLanguage
    if (newCountry) {
      if (newCountry === 'France' && finalLanguage !== 'fr') {
        syncedLanguage = 'fr'
      } else if (newCountry === 'Lebanon' && finalLanguage !== 'ar') {
        syncedLanguage = 'ar'
      }
    }
    
    applyLocalePrefix({
      currentPathname: location.pathname,
      country: finalCountry,
      language: syncedLanguage,
      navigate,
      onLanguageChange: (lang) => {
        if (handleLanguage) {
          handleLanguage(lang)
          i18n.changeLanguage(lang)
        }
      },
      onCountryChange: (country) => {
        if (handleCountry) {
          handleCountry(country)
        }
      }
    })
  }

  // Handle language change from buttons
  const handleLanguageChange = (lang) => {
    applyLocaleChange(null, lang)
  }

  // Handle country change from dropdown
  const handleCountryChange = (country) => {
    applyLocaleChange(country, null)
    setshowCountry(false)
  }

  const goToHomeSection = (id) => {
    closeAllDropdowns()
    const hash = id.startsWith('#') ? id : `#${id}`
    if (!isHome) {
      // Navigate to language-aware homepage with hash
      const home = buildPathWithLang(urlLang, "/")
      navigate(`${home}${hash}`)
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" })
      }, 200)
    } else {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" })
    }
    setOpen(false)
  }

  // Fixed header on ALL pages - stays at top while scrolling
  const headerWrapClass = "fixed top-0 left-0 w-full z-[999999]"

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-[#FA7800] font-saira font-[600] uppercase text-[14px] tracking-wide leading-[1] inline-block"
      : "text-white font-saira font-[600] uppercase text-[14px] tracking-wide leading-[1] hover:text-[#FA7800] transition duration-300 inline-block"

  const mobileNavLinkClass = ({ isActive }) =>
    isActive
      ? "block ltr:ml-[20px] rtl:mr-[20px] text-[#FA7800]"
      : "block ltr:ml-[20px] rtl:mr-[20px] text-[#FFFFFF]"

  return (
    <>
      <header ref={headerRef} className={headerWrapClass}>
        <div dir="ltr" className="header-top-bar bg-[#28509E] hidden md:flex flex-row justify-between items-center pt-[10px] pb-[10px] border-b-[0.5px] border-white/15 px-[20px] md:px-[40px] lg:px-[60px] xl:px-[80px] 2xl:px-[100px]">
          <div className="flex items-center">
            <Link
              to={`/`}
              className='hidden md:block'
              onClick={() => { closeAllDropdowns(); setOpen(false) }}
            >
              <ImageWebp srcWebp={`${ASSET}/assets/ArchiScaffoldinglogo_lossyalpha.webp`} src={`${ASSET}/assets/ArchiScaffoldinglogo_lossyalpha.webp`} alt='siteLogo' className='2xl:w-[150px] w-[100px]' />
            </Link>
          </div>

          <div className='flex flex-row items-center gap-[20px] md:gap-[20px] lg:gap-[20px] xl:gap-[20px] flex-nowrap'>
            <div className='inline-flex items-center gap-[8px]'>
              <ImageWebp srcWebp={`${ASSET}/assets/emailIcon_lossyalpha.webp`} src={`${ASSET}/assets/emailIcon_lossyalpha.webp`} className='w-[20px] h-[20px] flex-shrink-0' alt='emailIcon' />
              <span className='text-[14px] text-white font-[500] leading-[1] font-saira whitespace-nowrap inline-block'>achi.gr@hotmail.com</span>
            </div>

            <div className='inline-flex items-center gap-[8px]'>
              <ImageWebp srcWebp={`${ASSET}/assets/wpicon_lossyalpha.webp`} src={`${ASSET}/assets/wpicon_lossyalpha.webp`} className='w-[20px] h-[20px] flex-shrink-0' alt='whatsappIcon' />
              <span className='text-[14px] text-white font-[500] leading-[1] font-saira whitespace-nowrap inline-block' dir='ltr'>+96103322811</span>
            </div>

            <div className='hidden xl:inline-flex items-center gap-[20px]'>
              <a className='cursor-pointer inline-flex items-center' href='https://facebook.com/ACHISCAFF' target='_blank' rel="noreferrer"><img src={`${ASSET}/assets/iconoir_facebook.svg`} alt='Facebook' className='w-[20px] h-[20px]' /></a>
              <a className='cursor-pointer inline-flex items-center' href='https://www.instagram.com/achiscaffoldinglb' target='_blank' rel="noreferrer"><img src={`${ASSET}/assets/mdi_instagram.svg`} alt='Instagram' className='w-[20px] h-[20px]' /></a>
              <a className='cursor-pointer inline-flex items-center' href='https://twitter.com/AchiScaffolding' target='_blank' rel="noreferrer"><img src={`${ASSET}/assets/ri_twitter-x-fill.svg`} alt='X' className='w-[20px] h-[20px]' /></a>
              <a className='cursor-pointer inline-flex items-center' href='https://www.linkedin.com/company/achi-scaffolding/' target='_blank' rel="noreferrer"><img src={`${ASSET}/assets/basil_linkedin-outline.svg`} alt='LinkedIn' className='w-[20px] h-[20px]' /></a>
              <a className='cursor-pointer inline-flex items-center' href='https://www.tiktok.com/@achiscaffolding' target='_blank' rel="noreferrer"><img src={`${ASSET}/assets/ph_tiktok-logo.svg`} alt='TikTok' className='w-[20px] h-[20px]' /></a>
            </div>
          </div>

          <div className='flex items-center gap-[18px] relative flex-nowrap'>
            <div className='inline-flex items-center gap-[8px] cursor-pointer relative' onClick={() => { closeAllDropdowns(); setshowCountry(!showCountry) }}>
              <CountryWeather country="Lebanon" coordinates={{ lat: 33.8938, lon: 35.5018 }} />
              <span className='text-white font-saira font-[500] text-[14px] leading-[1] whitespace-nowrap inline-block'>Lebanon</span>
              <ExpandMoreIcon fontSize={'small'} className='text-white cursor-pointer flex-shrink-0' style={{ fontSize: '18px' }} />
              <div className={`absolute right-0 top-[50px] bg-white p-[16px] ${showCountry ? 'flex' : 'hidden'} z-[999]`}>
                <div className='flex flex-col'>
                  <span className='text-[#00204A] font-saira font-[500] text-[14px] leading-[1] cursor-pointer hover:text-[#FA7800] transition duration-500 inline-block' onClick={() => handleCountryChange('Lebanon')}>Lebanon</span>
                </div>
              </div>
            </div>

            <div className='inline-flex items-center gap-[8px]' role="group" aria-label="Language selector">
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                aria-label="Switch to English"
                aria-current={currentLang === 'en' ? 'true' : 'false'}
                className={`lang-btn ${currentLang === 'en' ? 'is-active' : ''}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('fr')}
                aria-label="Switch to French"
                aria-current={currentLang === 'fr' ? 'true' : 'false'}
                className={`lang-btn ${currentLang === 'fr' ? 'is-active' : ''}`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('ar')}
                aria-label="Switch to Arabic"
                aria-current={currentLang === 'ar' ? 'true' : 'false'}
                className={`lang-btn ${currentLang === 'ar' ? 'is-active' : ''}`}
              >
                AR
              </button>
            </div>
          </div>
        </div>

        <nav
          dir="ltr"
          className={`hidden md:block transition-all duration-300 ${
            isHome
              ? `relative border-b-0 ${
                  isScrolled
                    ? "bg-[#28509E]/90 backdrop-blur-md"
                    : "bg-transparent"
                }`
              : `relative border-b-[#FFFFFF]/70 border-b-[0.5px] border-solid ${
                  isScrolled
                    ? "bg-[#28509E] backdrop-blur-md"
                    : "bg-[#28509E]"
                }`
          }`}
        >
          <div className="w-full flex justify-center">
            <ul className={`${isHome ? "flex gap-8 py-[18px] px-[20px] md:px-[40px] lg:px-[60px] xl:px-[80px] 2xl:px-[100px]" : "flex gap-8 py-[12px] px-[20px] md:px-[40px] lg:px-[60px] xl:px-[80px] 2xl:px-[100px]"}`}>
             <li><NavLink to={buildPathWithLang(urlLang, "/")} className={navLinkClass} onClick={closeAllDropdowns}>{t("nav.home")}</NavLink></li>
<li><NavLink to={buildPathWithLang(urlLang, "/about")} className={navLinkClass} onClick={closeAllDropdowns}>{t("nav.about")}</NavLink></li>
<li><NavLink to={buildPathWithLang(urlLang, "/services")} className={navLinkClass} onClick={closeAllDropdowns}>{t("nav.services")}</NavLink></li>
{/* <li><NavLink to={buildPathWithLang(urlLang, "/products")} className={navLinkClass} onClick={closeAllDropdowns}>{t("nav.products")}</NavLink></li> */}
<li><NavLink to={buildPathWithLang(urlLang, "/sectors")} className={navLinkClass} onClick={closeAllDropdowns}>{t("nav.sectors")}</NavLink></li>
<li><button className="text-white font-saira font-[600] uppercase text-[14px] tracking-wide leading-[1] hover:text-[#FA7800] transition duration-300 inline-block" onClick={() => goToHomeSection("clients")}>{t("nav.clients")}</button></li>
<li><NavLink to={buildPathWithLang(urlLang, "/projects")} className={navLinkClass} onClick={closeAllDropdowns}>{t("nav.projects")}</NavLink></li>
<li><NavLink to={buildPathWithLang(urlLang, "/blog")} className={navLinkClass} onClick={closeAllDropdowns}>{t("nav.blog")}</NavLink></li>
<li><NavLink to={buildPathWithLang(urlLang, "/gallery")} className={navLinkClass} onClick={closeAllDropdowns}>{t("nav.gallery")}</NavLink></li>
{/* <li><NavLink to={buildPathWithLang(urlLang, "/career")} className={navLinkClass} onClick={closeAllDropdowns}>{t("nav.careers")}</NavLink></li> */}
<li><button className="text-white font-saira font-[600] uppercase text-[14px] tracking-wide leading-[1] hover:text-[#FA7800] transition duration-300 inline-block" onClick={() => goToHomeSection("contactForm")}>{t("nav.contact")}</button></li>
 </ul>
          </div>
        </nav>

        <div className='bg-[#28509E] flex md:hidden flex-row justify-between items-center pt-[8px] pb-[8px] sm:pr-[20px] border-b-[#FFFFFF]/70 border-b-[0.5px] border-solid'>
          <div className='flex flex-row justify-between items-center w-[100%] px-[8px] sm:px-[0px] ltr:ml-[20px] rtl:mr-[20px]'>
            <Link to={`/`} onClick={() => { closeAllDropdowns(); setOpen(false) }}>
              <img className='w-[90px]' src={`${ASSET}/assets/ArchiScaffoldinglogo.png`} alt='siteLogo' />
            </Link>
          </div>

          <div className='ltr:mr-[20px] rtl:ml-[20px] md:hidden'>
            <MenuIcon sx={{ fontSize: "40px" }} className="text-white cursor-pointer" onClick={() => { closeAllDropdowns(); setOpen(!open) }} />
          </div>
        </div>
      </header>

      <ul className={`md:hidden bg-[#28509E] text-white fixed w-full top-0 overflow-y-auto bottom-0 py-[40px] text-start duration-500 ${open ? "left-0" : "left-[-100%]"} z-[99999999] ltr:pl-3 rtl:pr-3`}>
        <li>
          <div className='flex justify-between items-center mb-[25px]'>
            <div className='flex flex-row justify-between items-center w-[100%] px-[8px] sm:px-[0px]'>
              <Link to={`/`} onClick={() => setOpen(false)}>
                <ImageWebp srcWebp={`${ASSET}/assets/ArchiScaffoldinglogo_lossyalpha.webp`} className='w-[90px]' src={`${ASSET}/assets/ArchiScaffoldinglogo_lossyalpha.webp`} alt='siteLogo' />
              </Link>
            </div>
            <div className='ltr:mr-5 rtl:ml-5'>
              <CloseIcon fontSize={'large'} className="text-[#BED0FF] cursor-pointer" onClick={() => setOpen(false)} />
            </div>
          </div>
        </li>

      <NavLink to={buildPathWithLang(urlLang, "/")} className={mobileNavLinkClass} onClick={() => setOpen(false)}><p className='font-[500] text-[20px] font-saira py-2'>{t("nav.home")}</p></NavLink>
<NavLink to={buildPathWithLang(urlLang, "/about")} className={mobileNavLinkClass} onClick={() => setOpen(false)}><p className='font-[500] text-[20px] font-saira py-2'>{t("nav.about")}</p></NavLink>
<NavLink to={buildPathWithLang(urlLang, "/services")} className={mobileNavLinkClass} onClick={() => setOpen(false)}><p className='font-[500] text-[20px] font-saira py-2'>{t("nav.services")}</p></NavLink>
{/* <NavLink to={buildPathWithLang(urlLang, "/products")} className={mobileNavLinkClass} onClick={() => setOpen(false)}><p className='font-[500] text-[20px] font-saira py-2'>{t("nav.products")}</p></NavLink> */}
<NavLink to={buildPathWithLang(urlLang, "/sectors")} className={mobileNavLinkClass} onClick={() => setOpen(false)}><p className='font-[500] text-[20px] font-saira py-2'>{t("nav.sectors")}</p></NavLink>
<li className='ltr:ml-[20px] rtl:mr-[20px]'><p className='font-[500] text-[20px] cursor-pointer hover:text-[#FA7800] transition duration-500 font-saira py-2' onClick={() => goToHomeSection("clients")}>{t("nav.clients")}</p></li>
<NavLink to={buildPathWithLang(urlLang, "/projects")} className={mobileNavLinkClass} onClick={() => setOpen(false)}><p className='font-[500] text-[20px] font-saira py-2'>{t("nav.projects")}</p></NavLink>
<NavLink to={buildPathWithLang(urlLang, "/blog")} className={mobileNavLinkClass} onClick={() => setOpen(false)}><p className='font-[500] text-[20px] font-saira py-2'>{t("nav.blog")}</p></NavLink>
<NavLink to={buildPathWithLang(urlLang, "/gallery")} className={mobileNavLinkClass} onClick={() => setOpen(false)}><p className='font-[500] text-[20px] font-saira py-2'>{t("nav.gallery")}</p></NavLink>
{/* <NavLink to={buildPathWithLang(urlLang, "/career")} className={mobileNavLinkClass} onClick={() => setOpen(false)}><p className='font-[500] text-[20px] font-saira py-2'>{t("nav.careers")}</p></NavLink> */}
<li className='ltr:ml-[20px] rtl:mr-[20px] border-[#FFFFFF] border-solid border-b-[2px] pb-[30px]'><p className='font-[500] text-[20px] cursor-pointer hover:text-[#FA7800] transition duration-500 font-saira py-2' onClick={() => goToHomeSection("contactForm")}>{t("nav.contact")}</p></li>

        <li className='ltr:ml-[20px] rtl:mr-[20px] mt-[30px] pt-[20px] border-t-[#FFFFFF] border-t-[1px] border-solid'>
          <p className='font-[500] text-[18px] font-saira mb-[16px] text-white/90'>Language</p>
          <div className='inline-flex items-center gap-[8px]' role="group" aria-label="Language selector">
            <button
              type="button"
              onClick={() => { handleLanguageChange('en'); setOpen(false); }}
              aria-label="Switch to English"
              aria-current={currentLang === 'en' ? 'true' : 'false'}
              className={`lang-btn ${currentLang === 'en' ? 'is-active' : ''}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => { handleLanguageChange('fr'); setOpen(false); }}
              aria-label="Switch to French"
              aria-current={currentLang === 'fr' ? 'true' : 'false'}
              className={`lang-btn ${currentLang === 'fr' ? 'is-active' : ''}`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => { handleLanguageChange('ar'); setOpen(false); }}
              aria-label="Switch to Arabic"
              aria-current={currentLang === 'ar' ? 'true' : 'false'}
              className={`lang-btn ${currentLang === 'ar' ? 'is-active' : ''}`}
            >
              AR
            </button>
          </div>
        </li>
      </ul>
    </>
  )
}

export default Header
