'use client';

export const HeadphonesIcon = ({ size = 16 }: { size?: number }) => {
  return (
    <svg
      height={size}
      strokeLinejoin="round"
      viewBox="0 0 16 16"
      width={size}
      style={{ color: 'currentcolor' }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 0C3.58172 0 0 3.58172 0 8V12C0 12.5523 0.447715 13 1 13H3V8C3 5.23858 5.23858 3 8 3C10.7614 3 13 5.23858 13 8V13H15C15.5523 13 16 12.5523 16 12V8C16 3.58172 12.4183 0 8 0ZM4.5 8V14C4.5 14.5523 4.94772 15 5.5 15H6.5C7.05228 15 7.5 14.5523 7.5 14V8C7.5 7.44772 7.05228 7 6.5 7H5.5C4.94772 7 4.5 7.44772 4.5 8ZM9.5 7C8.94772 7 8.5 7.44772 8.5 8V14C8.5 14.5523 8.94772 15 9.5 15H10.5C11.0523 15 11.5 14.5523 11.5 14V8C11.5 7.44772 11.0523 7 10.5 7H9.5Z"
        fill="currentColor"
      />
    </svg>
  );
};