import { SITE_URL } from "@/app/site";

/**
 * People who sign posts. A post whose `author` matches `name` gets a byline link to /blog/authors/<slug>
 * and a Person in its Article schema (an E-E-A-T signal); anything else ("The Adaptral team") is
 * credited to the Organization. Only facts the person has stated publicly go here.
 */
export type Author = { slug: string; name: string; role: string; bio: string; photo: string; sameAs: string[] };

export const AUTHORS: Author[] = [
  {
    slug: "divyanshu-shekhar",
    name: "Divyanshu Shekhar",
    role: "CEO, Adaptral",
    bio: "Divyanshu Shekhar is the CEO of Adaptral, which moves narrow, high-volume LLM calls to small models fine-tuned for one company's workflow. He is a startup founder, most recently at Reticle, and part of Entrepreneurs First.",
    photo: "/team/divyanshu.jpg",
    sameAs: ["https://www.linkedin.com/in/dshekhar17/", "https://github.com/divshekhar", "https://x.com/dshekhar17"],
  },
  {
    slug: "abhinav-vashisht",
    name: "Abhinav Vashisht",
    role: "CTO, Adaptral",
    bio: "Abhinav Vashisht is the CTO of Adaptral. He was a software engineer at Amazon for over four years and is part of Entrepreneurs First.",
    photo: "/team/abhinav.jpg",
    sameAs: ["https://www.linkedin.com/in/abhinav-vashisht-305128131/"],
  },
];

export const authorByName = (name: string) => AUTHORS.find((a) => a.name === name);
export const authorBySlug = (slug: string) => AUTHORS.find((a) => a.slug === slug);

export function personSchema(author: Author) {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/blog/authors/${author.slug}#person`,
    name: author.name,
    url: `${SITE_URL}/blog/authors/${author.slug}`,
    jobTitle: author.role,
    description: author.bio,
    image: `${SITE_URL}${author.photo}`,
    worksFor: { "@id": `${SITE_URL}/#organization` },
    sameAs: author.sameAs,
  };
}
