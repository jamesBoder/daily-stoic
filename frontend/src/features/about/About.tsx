import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


// About Page Component
export const About: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all font-medium"
        >
          <svg
            className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('about.back')}
        </button>
      </div>

      {/* Hero Section */}
      <section className="text-center py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 opacity-50"></div>
        <div className="relative">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
            Daily Stoic
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 font-light">
            {t('about.subtitle')}
          </p>
          <div className="mt-6 flex justify-center">
            <div className="h-1 w-24 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="max-w-4xl mx-auto py-16 px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 md:p-12 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-primary-600 dark:text-primary-400 flex items-center justify-center sm:justify-start">
            <span className="text-3xl sm:text-4xl mr-3">🙏</span>
            {t('about.mission')}
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            {t('about.missionText')}
          </p>
        </div>
      </section>

      {/* Features Overview Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-primary-600 dark:text-primary-400">
          {t('about.features')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { emoji: '📖', titleKey: 'about.feature1Title', descKey: 'about.feature1Desc' },
            { emoji: '⭐', titleKey: 'about.feature2Title', descKey: 'about.feature2Desc' },
            { emoji: '📜', titleKey: 'about.feature3Title', descKey: 'about.feature3Desc' },
            { emoji: '💬', titleKey: 'about.feature4Title', descKey: 'about.feature4Desc' },
            { emoji: '🌙', titleKey: 'about.feature5Title', descKey: 'about.feature5Desc' },
            { emoji: '📱', titleKey: 'about.feature6Title', descKey: 'about.feature6Desc' },
          ].map(({ emoji, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="group bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-500 dark:hover:border-primary-400 text-center"
            >
              <div className="text-4xl sm:text-5xl mb-4 transform group-hover:scale-110 transition-transform">{emoji}</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 text-primary-600 dark:text-primary-400">{t(titleKey)}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t(descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sign-Up CTA */}
      <section className="py-8 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-500 dark:to-purple-500 rounded-2xl shadow-xl p-8 text-center text-white">
            <div className="text-4xl mb-4">🌟</div>
            <h3 className="text-2xl font-bold mb-3">{t('about.ctaTitle')}</h3>
            <p className="text-primary-100 mb-6 text-lg leading-relaxed">{t('about.ctaDesc')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-primary-50 transition-colors shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                {t('about.createAccount')}
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors border border-white/40"
              >
                {t('about.alreadyHaveAccount')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-primary-600 dark:text-primary-400">
            🚀 {t('about.comingSoon')}
          </h2>
          <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-2xl p-8 border-2 border-primary-200 dark:border-primary-800">
            <ul className="space-y-4 text-lg text-gray-700 dark:text-gray-300">
              <li className="flex items-center gap-3"><span className="text-2xl">💬</span><span>{t('about.comingSoon1')}</span></li>
              <li className="flex items-center gap-3"><span className="text-2xl">🔥</span><span>{t('about.comingSoon2')}</span></li>
              <li className="flex items-center gap-3"><span className="text-2xl">🌐</span><span>{t('about.comingSoon3')}</span></li>
              <li className="flex items-center gap-3"><span className="text-2xl">✨</span><span>{t('about.comingSoon4')}</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Get in Touch Section */}
      <section id="contact" className="max-w-4xl mx-auto py-16 px-4 sm:px-6">
        <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/30 dark:to-purple-900/30 rounded-2xl shadow-xl p-6 sm:p-10 border-2 border-primary-200 dark:border-primary-800">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <span className="text-3xl sm:text-4xl mr-3">✉️</span>
            {t('about.getInTouch')}
          </h2>
          <p className="text-center mb-6 text-base sm:text-lg text-gray-700 dark:text-gray-300">
            {t('about.contactDesc')}
          </p>

          {/* Email Contact */}
          <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm sm:text-base">{t('about.emailUs')}</p>
            <a
              href="mailto:wordsofpraiseapp@gmail.com?subject=Words%20of%20Praise%20-%20Inquiry"
              className="text-lg sm:text-2xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors inline-block hover:scale-105 transform break-all"
            >
              wordsofpraiseapp@gmail.com
            </a>
            <p className="text-xs sm:text-sm mt-4 text-gray-500 dark:text-gray-500">
              {t('about.responseTime')}
            </p>
          </div>

          {/* Social Media */}
          <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md">
            <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm sm:text-base">{t('about.followInstagram')}</p>
            <a
              href="https://instagram.com/wordsofpraiseapp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all hover:scale-105 transform"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                  clipRule="evenodd"
                />
              </svg>
              @wordsofpraiseapp
            </a>
            <p className="text-xs sm:text-sm mt-3 text-gray-500 dark:text-gray-500">
              {t('about.instagramUpdate')}
            </p>
          </div>
        </div>
      </section>

      {/* Dedication Section */}
      <section className="max-w-4xl mx-auto py-16 px-4 sm:px-6 mb-8">
        <div className="bg-gradient-to-br from-white to-primary-50 dark:from-gray-800 dark:to-primary-900/20 rounded-2xl shadow-2xl p-8 sm:p-10 md:p-12 border-l-8 border-primary-600 dark:border-primary-400 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 dark:bg-primary-900/30 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full -ml-12 -mb-12"></div>
          <div className="relative text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
              {t('about.inLovingMemory')}
            </h2>
            <p className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent mb-6">
              Clairemena Jean-Pierre
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 italic">
              {t('about.devotedChild')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
