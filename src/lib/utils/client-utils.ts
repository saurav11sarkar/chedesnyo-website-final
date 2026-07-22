export const isClient = typeof window !== 'undefined';

export const scrollToTop = () => {
  if (isClient) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

export const reloadPage = () => {
  if (isClient) {
    window.location.reload();
  }
};

export const navigateTo = (url: string) => {
  if (isClient) {
    window.location.href = url;
  }
};

export const openInNewTab = (url: string) => {
  if (isClient) {
    window.open(url, "_blank");
  }
};