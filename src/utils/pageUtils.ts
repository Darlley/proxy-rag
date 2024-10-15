import { JSDOM } from 'jsdom';

export function reconstructUrl({ url }: { url: string[] }) {
  const decodedComponents = url.map((component) =>
    decodeURIComponent(component)
  );
  return decodedComponents.join('/');
}

export async function getPageH1(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const h1 =
      dom.window.document.querySelector('h1')?.textContent?.trim() || null;
    return h1;
  } catch (error) {
    console.error('Erro ao obter o H1 da página:', error);
    return null;
  }
}

