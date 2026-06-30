import stringSimilarity from 'string-similarity';

export const extractIds = (
  prompt: string,
  list: { name: string; _id: any }[],
) => {
  const words = prompt.toLowerCase().split(/\s+/);

  return list
    .filter((item) => {
      const brandName = item.name.toLowerCase();

      return words.some(
        (word) => stringSimilarity.compareTwoStrings(word, brandName) > 0.7,
      );
    })
    .map((item) => item._id.toString())
    .join(',');
};

export const extractSearchTerm = (prompt: string, removeWords: string[]) => {
  let text = prompt.toLowerCase();

  // remove brand/category names
  removeWords.forEach((word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    text = text.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), '');
  });

  // remove common phrases
  text = text.replace(
    /\b(do you have|i need|show me|give me|find me|i want|can you show)\b/gi,
    '',
  );

  // remove filler words
  text = text.replace(
    /\b(i|need|some|show|me|want|give|find|available|and|with|the|a|an|for|please|brand)\b/gi,
    '',
  );

  // remove extra spaces
  text = text.replace(/\s+/g, ' ').trim();

  // remove duplicate words
  const uniqueWords = [...new Set(text.split(' '))];

  return uniqueWords.join(' ');
};

export const formatProductsForAI = (products: any[]) => {
  return products
    .map((product, index) => {
      return `
Product ${index + 1}:

ID: ${product._id}

Name: ${product.name}

Category: ${product.category?.name || ""}

Price: ${product.discountPrice} $

Stock: ${product.stock ? "Available" : "Out of stock"}

Tags: ${product.tags?.join(", ") || ""}
`;
    })
    .join("\n-------------------\n");
};
