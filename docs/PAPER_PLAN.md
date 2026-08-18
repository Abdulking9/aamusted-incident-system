# Paper 2: plan, and what has to change first

Working plan for turning the undergraduate study into a submittable paper.

---

## 1. The framing has to change

The raw UAT data from the 20-stakeholder evaluation no longer exists. Only the
thesis write-up survives. That rules out an evaluation paper, because the
central claim would rest on numbers that cannot be produced on request.

**Write it as an experience report instead.** The contribution becomes the
account of building and deploying a system in a resource-constrained African
university, not a measured comparison. That is a recognised paper type, it is
honest about the evidence, and it suits the venues below.

What that changes in practice:

- Remove every quantitative claim that has no surviving data behind it. The
  thesis says testing showed "improved efficiency, higher data accuracy and
  increased reporting participation" with no figures. **Cut those sentences or
  attribute them explicitly as unmeasured observations.** They are the first
  thing a reviewer will ask for.
- Lead with design decisions and their rationale, which the thesis documents
  well: role separation, severity tagging, evidence upload, audit logging.
- Report the UAT as a described process, stating plainly that the instrument
  responses were not retained.

---

## 2. The reference list must be rebuilt from scratch

**Every citation in the current writing sample appears to be fabricated.** Two
were checked directly and neither exists. The pattern is characteristic:
titles that restate the sentence they support, and journals with near-miss
names. `Safety Science Review` is not a journal; **Safety Science** is.
`Journal of Security Informatics` is not a journal; **Security Informatics** is.
The same applies to `International Journal of Cybersecurity` and
`Journal of Information Systems` as cited.

Do not reuse any of them. Do not reuse them in the ATC paper either.

### Citations verified against Crossref

These three are confirmed: authors, title, venue, year and DOI come from the
Crossref API, not from a search result or from memory. They can be cited as
written.

**Villegas-Ch., W., Ortiz-Garces, I., & Sánchez-Viteri, S. (2021).** Proposal
for an Implementation Guide for a Computer Security Incident Response Team on a
University Campus. *Computers*, 10(8), 102.
https://doi.org/10.3390/computers10080102

**Gil-Hernández, E., Carrillo, I., Guilabert, M., Bohomol, E., Serpa, P. C.,
Ribeiro Neves, V., Maluenda Martínez, M., Martin-Delgado, J., Pérez-Esteve, C.,
Fernández, C., & Mira, J. J. (2024).** Development and Implementation of a
Safety Incident Report System for Health Care Discipline Students During
Clinical Internships: Observational Study. *JMIR Medical Education*, 10, e56879.
https://doi.org/10.2196/56879

> Directly comparable prior work: a deployed web-based incident reporting
> platform, 105 students across five countries, 147 reports, with an evaluation.
> This is the closest thing to what Paper 2 describes and should be positioned
> against. Note the venue is JMIR Medical Education, not what its title suggests.

**Sandhu, R. S., Coyne, E. J., Feinstein, H. L., & Youman, C. E. (1996).**
Role-Based Access Control Models. *Computer*, 29(2), 38-47.
https://doi.org/10.1109/2.485845

### Located but not yet verified

These exist and were found through search, but have no DOI readily available and
sit on platforms that block automated access. **Open each one, confirm the
author list and venue from the paper itself, and check it actually supports the
claim you attach to it.** Being real is necessary, not sufficient.

| Topic | Source |
|---|---|
| Campus incident reporting, near-identical design and stack | *Comprehensive Security and Incident Reporting System for Enhancing Campus Safety of Students at the University of Nigeria, Nsukka.* [ResearchGate](https://www.researchgate.net/publication/396863698_COMPREHENSIVE_SECURITY_AND_INCIDENT_REPORTING_SYSTEM_FOR_ENHANCING_CAMPUS_SAFETY_OF_STUDENTS_AT_THE_UNIVERSITY_OF_NIGERIA_NSUKKA) |
| Incident reporting and security risk | *The Role of Incident Reporting in Reducing Information Security Risks.* [ResearchGate](https://www.researchgate.net/publication/255634290_The_Role_of_Incident_Reporting_in_Reducing_Information_Security_Risks) |
| Web-based safety management in higher education | *Design and Application of Web-Based Campus Safety Facilities Management Information System in Higher Vocational Colleges.* [ResearchGate](https://www.researchgate.net/publication/372123212_Design_and_Application_of_Web-Based_Campus_Safety_Facilities_Management_Information_System_in_Higher_Vocational_Colleges) |
| ICT4D in African higher education | *ICT4D, Policy Landscapes, and Practice Arenas.* [Academia](https://www.academia.edu/37339280/) |
| ICT4D sustainability and failure modes | *Sustainable ICT4D in Africa: Where Do We Go From Here?* [Academia](https://www.academia.edu/33959465/) |

The Nsukka paper matters most: same problem, same region, same three-tier
architecture, same stack. **Positioning against it is essential.** A reviewer who
knows the area will find it, and a paper that fails to cite its nearest
neighbour looks careless at best.

**How to verify one properly.** Find its DOI, then:

```
curl -s "https://api.crossref.org/works/<DOI>" | python -m json.tool
```

That returns the authoritative author list, venue, volume and year. If a source
has no DOI and no indexed record, consider whether it belongs in the
bibliography at all.

### What could not be sourced

**Role-based access control** is covered by Sandhu et al. (1996) above, the
canonical reference and one of the most cited papers in the field. Verified
through several independent listings.

**Audit logging** and **severity classification** produced nothing citable. A
search returned vendor documentation, product blogs and patents, with no
peer-reviewed work suitable for a reference list.

Two honest options, and only these two:

1. Search properly in Google Scholar, ACM DL and IEEE Xplore rather than the
   open web, and cite what you actually find.
2. **Drop the claims.** The paper does not need a citation to say the system
   keeps an append-only audit log or tags severity. Those are design decisions,
   not contested assertions. Describe them and move on.

Option 2 is usually right. An uncited design decision is normal; a fabricated
citation supporting one is fatal. The previous reference list existed because
someone felt every sentence needed a source. It did not.

---

## 3. Structure

1. **Introduction.** Campus safety reporting in a resource-constrained setting.
   The paper-based process and its five documented failure modes: delayed
   reporting, inconsistent data, fragile records, no analytics, no transparency.
2. **Related work.** Position against the Nsukka system and the ICT4D
   literature. State what is different here: the audit trail, the severity
   model, and the later re-implementation.
3. **Context.** AAMUSTED, the stakeholders, the constraints. This section is
   the paper's actual value and the thesis barely covers it. Intermittent
   connectivity, no mobile app, shared devices, staff with varying digital
   literacy.
4. **System design.** Three-tier architecture, role-based access, eight incident
   categories, four-stage lifecycle, severity tagging, evidence upload,
   append-only audit log. The thesis material is strong here; condense it.
5. **Deployment and observations.** What actually happened. Qualitative,
   clearly labelled as such.
6. **Reflection.** What transferred and what did not. The honest finding: the
   original PHP/MySQL system was later rebuilt on React and Express, and the
   reasons for that are worth a paragraph.
7. **Limitations.** Evaluation instrument responses not retained. Single
   institution. No control condition. Say it plainly and early.

---

## 4. Venues

Experience reports and deployment case studies are welcome at these; verify
every deadline directly rather than trusting a remembered date.

| Venue | Fit |
|---|---|
| **ACM COMPASS** | Computing and sustainable societies. Strong fit for a deployed system in an under-resourced setting. |
| **IEEE AFRICON** | Regional, receptive to applied engineering work from African institutions. |
| **ICT4D / IFIP WG 9.4** | Purpose-built for exactly this kind of report. |
| **IST-Africa** | Applied, practitioner-friendly, faster cycle. |

Post a preprint as soon as it is submitted and list it as under review. Do not
wait for acceptance before using it on applications.

---

## 5. What the paper can honestly claim

**Yes:**
- A working system was designed, built and deployed against documented
  requirements gathered from real stakeholders.
- The design decisions and their rationale, which generalise to similar
  institutions.
- The constraints of the setting, which is the part most papers from
  well-resourced contexts miss.
- A later re-implementation on a different stack, and what that revealed.

**No, unless data resurfaces:**
- Any claim of improved efficiency, accuracy or participation.
- Comparisons with the paper process.
- User satisfaction of any kind.

The first list is enough for an experience report. The second is what would
have made it an evaluation paper, and that option closed when the data was
lost. Worth remembering for the next system you deploy: **keep the instrument
responses.**
