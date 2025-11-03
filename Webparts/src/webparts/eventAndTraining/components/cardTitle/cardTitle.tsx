import * as React from "react";
import styles from "./card.module.scss";

export const CardTitle: React.FC = () => {
  return (
    <div className={styles.eventsCard}>
      {/* Decorative Icons */}
      <div className={`${styles.icon} ${styles.iconTopLeft}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
        >
          <path
            d="M15.8614 20.5964L15.3506 18.6903C14.6915 16.2304 16.1645 14.7729 18.6173 15.427L20.5212 15.9383L22.4251 16.4496C24.878 17.1037 25.4163 19.1128 23.6191 20.9058L22.226 22.3005L20.8328 23.6953C19.0356 25.4882 17.0278 24.9495 16.3721 22.5025L15.8614 20.5964Z"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M23.0465 32.4721C30.1594 30.5662 34.3805 23.2551 32.4746 16.1422C30.5687 9.02931 23.2575 4.80821 16.1446 6.7141C9.03175 8.61999 4.81065 15.9312 6.71655 23.044C8.62244 30.1569 15.9336 34.378 23.0465 32.4721Z"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <div className={`${styles.icon} ${styles.iconTop}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
        >
          <path
            d="M12.2824 31.4393L20.0098 33.5098C26.4493 35.2353 29.7153 33.3497 31.4408 26.9102L33.5113 19.1828C35.2368 12.7433 33.3511 9.47728 26.9116 7.75182L19.1842 5.68127C12.7447 3.95581 9.47874 5.84143 7.75328 12.2809L5.68273 20.0083C3.95727 26.4478 5.84289 29.7138 12.2824 31.4393Z"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M16.423 15.9824C17.8455 16.3636 19.3078 15.5194 19.6889 14.0968C20.0701 12.6742 19.2259 11.212 17.8033 10.8308C16.3807 10.4496 14.9185 11.2939 14.5373 12.7164C14.1562 14.139 15.0004 15.6012 16.423 15.9824Z"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M5.17983 25.3291L12.6714 22.7675C13.8718 22.3575 15.3193 22.8282 16.0232 23.8588L16.3481 24.3462C17.1215 25.4783 18.7442 25.9131 19.98 25.3194L26.5696 22.1571C27.8054 21.5634 29.4282 21.9982 30.2015 23.1303L31.8177 25.4959"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <div className={`${styles.icon} ${styles.iconLeft}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
        >
          <path
            d="M19.1828 33.5074L26.9102 31.4368C33.3497 29.7114 35.2353 26.4454 33.5098 20.0059L31.4393 12.2785C29.7138 5.83898 26.4478 3.95336 20.0083 5.67883L12.2809 7.74938C5.84143 9.47484 3.95581 12.7408 5.68127 19.1803L7.75182 26.9077C9.47728 33.3472 12.7433 35.2329 19.1828 33.5074Z"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M11.8633 16.4931C13.4963 17.436 15.5956 16.8735 16.5512 15.237"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M20.0547 14.2978C21.6877 15.2406 23.787 14.6781 24.7426 13.0417"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M15.3036 22.1279L24.5765 19.6432C25.2205 19.4707 25.8737 19.8478 26.0462 20.4917C26.9055 23.6986 25.0105 26.9809 21.8036 27.8402C18.5967 28.6995 15.3144 26.8044 14.4551 23.5976C14.2826 22.9536 14.6597 22.3004 15.3036 22.1279Z"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <div className={`${styles.icon} ${styles.iconRight}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
        >
          <path
            d="M17.1821 28.6133C21.4451 29.7556 25.8378 27.2194 26.9801 22.9565L28.7055 16.5169C29.8478 12.254 27.3116 7.86124 23.0487 6.71899C18.7857 5.57674 14.393 8.11289 13.2507 12.3758L11.5253 18.8153C10.383 23.0783 12.9192 27.4711 17.1821 28.6133Z"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M8.34862 15.2031L7.65843 17.7789C5.94332 24.1798 9.74284 30.7608 16.1437 32.4759C22.5446 34.191 29.1255 30.3915 30.8407 23.9906L31.5308 21.4148"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M17.4343 12.7763C19.9511 12.5534 22.4496 13.2229 24.5177 14.6743"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M17.5835 16.9594C19.2429 16.9485 20.8785 17.3868 22.3101 18.2259"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <div className={`${styles.icon} ${styles.iconBottomRight}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
        >
          <path
            d="M16.2987 34.2858L29.7959 30.6692C33.3505 29.7168 34.184 27.1606 33.6405 24.4627L31.4598 13.6452C30.8947 10.815 28.048 9.0517 25.2532 9.80055C24.4676 10.0111 23.6256 9.75354 23.0786 9.1547L21.651 7.53571C20.7445 6.52246 18.9402 5.97065 17.6265 6.32264L14.6772 7.1129C13.3507 7.46835 12.064 8.84838 11.7856 10.1791L11.3587 12.295C11.1845 13.0871 10.584 13.7311 9.7984 13.9417C7.00365 14.6905 5.41998 17.6409 6.34569 20.3745L9.86586 30.8331C10.7313 33.4448 12.7441 35.2383 16.2987 34.2858Z"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M16.2852 14.9619L20.1489 13.9266"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M21.6671 27.3211C23.9724 26.7034 25.3489 24.3192 24.7312 22.0139C24.1135 19.7085 21.7293 18.332 19.424 18.9497C17.1186 19.5674 15.7421 21.9516 16.3598 24.257C16.9775 26.5623 19.3617 27.9388 21.6671 27.3211Z"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <div className={`${styles.icon} ${styles.iconCenter}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
        >
          <path
            d="M31.4408 26.9102L33.5113 19.1828C35.2368 12.7433 33.3511 9.47728 26.9116 7.75182L19.1842 5.68127C12.7447 3.95581 9.47874 5.84143 7.75328 12.2809L5.68273 20.0083C3.95727 26.4478 5.84289 29.7138 12.2824 31.4393L20.0098 33.5098C26.4493 35.2353 29.7153 33.3497 31.4408 26.9102Z"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M9.07518 10.0234L33.4938 16.5664"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M18.5283 5.65625L16.8512 11.9154"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M27.4892 8.0625L25.9674 13.7421"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M15.8536 21.9749L16.2677 20.4294C16.7991 18.4461 18.4204 18.0108 19.8676 19.4615L20.9999 20.5931L22.1323 21.7248C23.5795 23.1754 23.1446 24.7982 21.166 25.3309L19.6195 25.7447L18.0731 26.1586C16.0944 26.6913 14.908 25.5038 15.4395 23.5204L15.8536 21.9749V21.9749Z"
            stroke="#DA291C"
            stroke-width="1.5"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h1 className={styles.title}>
          <span className={styles.titleEvents}>Events</span>
          <span className={styles.titleAnd}> & </span>
          <span className={styles.titleTrainings}>Trainings</span>
        </h1>
        <p className={styles.description}>
          Navigate through our exclusive events. Find the ones that excite you
          and become the part of the experience.
        </p>
      </div>

      {/* Decorative waves */}
      <div className={styles.waveTop}></div>
      <div className={styles.waveBottom}></div>
    </div>
  );
};
