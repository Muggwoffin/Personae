---
tags:
  - zotero
  - source
created: 2026-06-03T08:18
updated: 2026-06-03T13:21
---

citekey:: {{citekey}}
title:: {{title}}
authors:: {{authors}}{{directors}}
year:: {{date | format("YYYY")}}
itemType:: {{itemType}}
journal:: {{publicationTitle}}
volume:: {{volume}}
issue:: {{issue}}
pages:: {{pages}}
publisher:: {{publisher}}
place:: {{place}}
bookTitle:: {{bookTitle}}
editor:: {{editor}}
doi:: {{DOI}}
url:: {{url}}
zotero_link:: {{pdfZoteroLink}}

---

# {{title}}

**{{authors}}{{directors}}** ({{date | format("YYYY")}})

{% if abstractNote %}
> [!abstract]- Abstract
> {{abstractNote}}
{% endif %}

---

## Highlights & Notes

{% for annotation in annotations -%}
{%- if annotation.annotatedText -%}
> {{annotation.annotatedText}}

{% if annotation.color %}*{{annotation.colorCategory}} {{annotation.type | capitalize}}* {% else %}*{{annotation.type | capitalize}}* {% endif %}— [p. {{annotation.page}}](zotero://open-pdf/library/items/{{annotation.attachment.itemKey}}?page={{annotation.page}}&annotation={{annotation.id}})

{% endif -%}
{%- if annotation.imageRelativePath -%}
![[{{annotation.imageRelativePath}}]]
{% endif -%}
{% if annotation.comment %}
**Note:** {{annotation.comment}}

{% endif -%}
{% if annotation.allTags %}*Tags: {{annotation.allTags}}*
{% endif %}
{% endfor -%}
