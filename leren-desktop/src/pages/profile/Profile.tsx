import { useState, useEffect, FormEvent } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface ProfileData { fullName: string; school: string; gradeLevel: string; }

// ── Grade level groups ────────────────────────────────────────────────────
const GRADE_LEVELS = [
  { group: 'Middle School',        values: ['6th Grade', '7th Grade', '8th Grade'] },
  { group: 'High School',          values: ['9th Grade (Freshman)', '10th Grade (Sophomore)', '11th Grade (Junior)', '12th Grade (Senior)'] },
  { group: 'College / University', values: ['College Freshman (1st Year)', 'College Sophomore (2nd Year)', 'College Junior (3rd Year)', 'College Senior (4th Year)'] },
  { group: 'Graduate',             values: ["Master's Student", 'PhD Student', 'Postdoctoral Researcher'] },
  { group: 'Other',                values: ['Other'] },
];

const COLLEGE_GRADES  = new Set([...GRADE_LEVELS[2].values, ...GRADE_LEVELS[3].values]);
const K12_GRADES      = new Set([...GRADE_LEVELS[0].values, ...GRADE_LEVELS[1].values]);

// ── US Colleges & Universities ────────────────────────────────────────────
const US_COLLEGES = [
  // Ivy League
  'Brown University', 'Columbia University', 'Cornell University', 'Dartmouth College',
  'Harvard University', 'Princeton University', 'University of Pennsylvania', 'Yale University',
  // Top Research
  'California Institute of Technology (Caltech)', 'Carnegie Mellon University', 'Duke University',
  'Emory University', 'Georgetown University', 'Georgia Institute of Technology',
  'Johns Hopkins University', 'Massachusetts Institute of Technology (MIT)', 'New York University (NYU)',
  'Northwestern University', 'Rice University', 'Stanford University', 'Tufts University',
  'Tulane University', 'University of Chicago', 'University of Notre Dame', 'Vanderbilt University',
  'Wake Forest University', 'Washington University in St. Louis',
  // University of California
  'UC Berkeley', 'UC Davis', 'UC Irvine', 'UC Los Angeles (UCLA)', 'UC Merced',
  'UC Riverside', 'UC San Diego', 'UC Santa Barbara', 'UC Santa Cruz',
  // Cal State
  'Cal Poly San Luis Obispo', 'Cal State Fullerton', 'Cal State Long Beach',
  'Cal State Los Angeles', 'San Diego State University', 'San Francisco State University', 'San Jose State University',
  // Big Ten
  'Indiana University Bloomington', 'Michigan State University', 'Ohio State University',
  'Penn State University', 'Purdue University', 'Rutgers University',
  'University of Illinois Urbana-Champaign', 'University of Iowa', 'University of Maryland',
  'University of Michigan', 'University of Minnesota', 'University of Nebraska-Lincoln', 'University of Wisconsin-Madison',
  // ACC
  'Boston College', 'Clemson University', 'Florida State University', 'Georgia Tech',
  'NC State University', 'Syracuse University', 'University of Miami',
  'University of North Carolina at Chapel Hill', 'University of Pittsburgh', 'University of Virginia', 'Virginia Tech',
  // SEC
  'Auburn University', 'Louisiana State University (LSU)', 'Mississippi State University',
  'University of Alabama', 'University of Arkansas', 'University of Florida', 'University of Georgia',
  'University of Kentucky', 'University of Mississippi', 'University of Missouri',
  'University of South Carolina', 'University of Tennessee', 'University of Texas at Austin',
  // Big 12
  'Baylor University', 'Kansas State University', 'Oklahoma State University', 'Texas A&M University',
  'Texas Christian University (TCU)', 'Texas Tech University', 'University of Kansas',
  'University of Oklahoma', 'West Virginia University',
  // Pac / Mountain West
  'Arizona State University', 'Boise State University', 'Oregon State University',
  'University of Arizona', 'University of Colorado Boulder', 'University of Oregon',
  'University of Utah', 'University of Washington', 'Washington State University',
  // Liberal Arts
  'Amherst College', 'Barnard College', 'Bowdoin College', 'Bryn Mawr College', 'Carleton College',
  'Claremont McKenna College', 'Colby College', 'Colgate University', 'Colorado College',
  'Davidson College', 'Grinnell College', 'Hamilton College', 'Harvey Mudd College',
  'Haverford College', 'Kenyon College', 'Macalester College', 'Middlebury College',
  'Mount Holyoke College', 'Oberlin College', 'Occidental College', 'Pomona College',
  'Scripps College', 'Smith College', 'Swarthmore College', 'Trinity College',
  'Vassar College', 'Wellesley College', 'Wesleyan University', 'Williams College',
  // Other Notable
  'American University', 'Babson College', 'Binghamton University (SUNY)', 'Boston University',
  'Brandeis University', 'Brigham Young University (BYU)', 'Butler University',
  'Case Western Reserve University', 'Chapman University', 'City University of New York (CUNY)',
  'Clark University', 'Drexel University', 'Fordham University', 'George Mason University',
  'George Washington University', 'Gonzaga University', 'Howard University',
  'Illinois Institute of Technology', 'Ithaca College', 'James Madison University',
  'Lafayette College', 'Lehigh University', 'Loyola Marymount University',
  'Loyola University Chicago', 'Marquette University', 'Morehouse College', 'Northeastern University',
  'Ohio University', 'Pepperdine University', 'Rensselaer Polytechnic Institute (RPI)',
  'Rochester Institute of Technology (RIT)', 'Santa Clara University', 'Seton Hall University',
  'Spelman College', 'Stevens Institute of Technology', 'Stony Brook University (SUNY)',
  'Temple University', 'Texas State University', 'Towson University',
  'UMass Amherst', 'UMass Boston', 'Union College', 'University at Albany (SUNY)',
  'University at Buffalo (SUNY)', 'University of Central Florida', 'University of Cincinnati',
  'University of Connecticut', 'University of Delaware', 'University of Denver',
  'University of Houston', 'University of Memphis', 'University of New Hampshire',
  'University of New Mexico', 'University of North Texas', 'University of Rhode Island',
  'University of San Diego', 'University of San Francisco', 'University of South Florida',
  'University of Southern California (USC)', 'University of Tampa', 'University of Vermont',
  'Villanova University', 'Virginia Commonwealth University', 'William & Mary',
  'Worcester Polytechnic Institute (WPI)', 'Xavier University',
].sort((a, b) => a.localeCompare(b));

// ── US High Schools & Middle Schools (by state) ───────────────────────────
const US_K12_SCHOOLS = [
  // Alabama
  'Auburn High School, AL', 'Bob Jones High School, AL', 'Hoover High School, AL',
  'Huntsville High School, AL', 'Mountain Brook High School, AL',
  // Alaska
  'Dimond High School, AK', 'East Anchorage High School, AK', 'Lathrop High School, AK',
  // Arizona
  'Basis Scottsdale, AZ', 'Chandler High School, AZ', 'Desert Vista High School, AZ',
  'Hamilton High School, AZ', 'Millennium High School, AZ', 'Perry High School, AZ',
  'Pinnacle High School, AZ', 'Scottsdale Preparatory Academy, AZ',
  // Arkansas
  'Bentonville High School, AR', 'Bryant High School, AR', 'Conway High School, AR',
  // California
  'Abraham Lincoln High School, CA', 'Arcadia High School, CA', 'Beverly Hills High School, CA',
  'Burlingame High School, CA', 'Castro Valley High School, CA', 'Cupertino High School, CA',
  'Diamond Bar High School, CA', 'El Camino Real Charter High School, CA',
  'Flintridge Preparatory School, CA', 'Foothill High School, CA', 'Fremont High School, CA',
  'Garfield High School, CA', 'Harvard-Westlake School, CA', 'Irvine High School, CA',
  'La Canada High School, CA', 'Los Alamitos High School, CA', 'Lowell High School, CA',
  'Lynbrook High School, CA', 'Mission San Jose High School, CA', 'Monta Vista High School, CA',
  'Palos Verdes Peninsula High School, CA', 'Palo Alto High School, CA',
  'Polytechnic School, CA', 'Ramona High School, CA', 'Redondo Union High School, CA',
  'San Marino High School, CA', 'Santa Monica High School, CA', 'Saratoga High School, CA',
  'Torrey Pines High School, CA', 'University High School (Irvine), CA',
  'Walnut High School, CA', 'Whitney High School, CA', 'Woodbridge High School, CA',
  // Colorado
  'Cherry Creek High School, CO', 'Douglas County High School, CO',
  'Fairview High School, CO', 'Legacy High School, CO', 'Regis Jesuit High School, CO',
  // Connecticut
  'Darien High School, CT', 'Greenwich High School, CT', 'New Canaan High School, CT',
  'Staples High School, CT', 'Westport High School, CT', 'Xavier High School, CT',
  // Delaware
  'Alexis I. duPont High School, DE', 'Newark High School, DE',
  // Florida
  'Boca Raton High School, FL', 'Booker T. Washington High School, FL',
  'Coral Gables Senior High School, FL', 'Dr. Michael M. Krop Senior High School, FL',
  'Doral Academy, FL', 'Eastside High School, FL', 'Flanagan High School, FL',
  'Gainesville High School, FL', 'Miramar High School, FL', 'Naples High School, FL',
  'Palm Beach Gardens High School, FL', 'Suncoast High School, FL',
  'West Boca Raton High School, FL', 'Westglades Middle School, FL', 'Weston Hills Middle School, FL',
  // Georgia
  'Cambridge High School, GA', 'Chattahoochee High School, GA', 'Grady High School, GA',
  'Lambert High School, GA', 'Milton High School, GA', 'Northview High School, GA',
  'Roswell High School, GA', 'Walton High School, GA', 'Wheeler High School, GA',
  // Hawaii
  'Iolani School, HI', 'Kamehameha Schools, HI', 'Punahou School, HI',
  // Idaho
  'Boise High School, ID', 'Eagle High School, ID', 'Skyline High School, ID',
  // Illinois
  'Chicago Latin School, IL', 'Evanston Township High School, IL',
  'Glenbard West High School, IL', 'Hinsdale Central High School, IL',
  'Jones College Prep, IL', 'Lake Forest High School, IL', 'Naperville Central High School, IL',
  'Neuqua Valley High School, IL', 'New Trier High School, IL', 'Northside College Prep, IL',
  'Oswego High School, IL', 'Stevenson High School, IL', 'Walter Payton College Prep, IL',
  'Wheaton Warrenville South High School, IL',
  // Indiana
  'Carmel High School, IN', 'Fishers High School, IN', 'Hamilton Southeastern High School, IN',
  'Penn High School, IN', 'Warren Central High School, IN', 'Westfield High School, IN',
  // Iowa
  'Ames High School, IA', 'Iowa City West High School, IA', 'Johnston High School, IA',
  // Kansas
  'Blue Valley High School, KS', 'Blue Valley North High School, KS',
  'Shawnee Mission East High School, KS',
  // Kentucky
  'duPont Manual High School, KY', 'Henry Clay High School, KY', 'Paul Laurence Dunbar High School, KY',
  // Louisiana
  'Benjamin Franklin High School, LA', 'Jesuit High School, LA', 'Lusher Charter School, LA',
  // Maine
  'Cape Elizabeth High School, ME', 'Portland High School, ME',
  // Maryland
  'Bethesda-Chevy Chase High School, MD', 'Blair High School, MD',
  'Centennial High School, MD', 'Glenelg High School, MD', 'Marriotts Ridge High School, MD',
  'Paint Branch High School, MD', 'Richard Montgomery High School, MD',
  'Thomas S. Wootton High School, MD',
  // Massachusetts
  'Acton-Boxborough Regional High School, MA', 'Belmont High School, MA',
  'Boston Latin School, MA', 'Brookline High School, MA', 'Cambridge Rindge and Latin School, MA',
  'Commonwealth School, MA', 'Concord-Carlisle High School, MA', 'Lexington High School, MA',
  'Milton Academy, MA', 'Newton North High School, MA', 'Phillips Academy Andover, MA',
  'Weston High School, MA',
  // Michigan
  'Bloomfield Hills High School, MI', 'East Lansing High School, MI',
  'Grosse Pointe South High School, MI', 'Holland High School, MI',
  'Northville High School, MI', 'Rochester High School, MI', 'Troy High School, MI',
  // Minnesota
  'Edina High School, MN', 'Hopkins High School, MN', 'Minnetonka High School, MN',
  'Wayzata High School, MN',
  // Mississippi
  'Clinton High School, MS', 'Madison Central High School, MS',
  // Missouri
  'Clayton High School, MO', 'Ladue Horton Watkins High School, MO', 'Marquette High School, MO',
  'Parkway West High School, MO', 'Rockhurst High School, MO',
  // Montana
  'Billings Senior High School, MT', 'Missoula Hellgate High School, MT',
  // Nebraska
  'Lincoln East High School, NE', 'Millard North High School, NE', 'Omaha Central High School, NE',
  // Nevada
  'Advanced Technologies Academy, NV', 'Clark High School, NV', 'Green Valley High School, NV',
  'Palo Verde High School, NV', 'Shadow Ridge High School, NV',
  // New Hampshire
  'Exeter High School, NH', 'Phillips Exeter Academy, NH',
  // New Jersey
  'Bergen County Academies, NJ', 'Cherokee High School, NJ',
  'Chatham High School, NJ', 'Delbarton School, NJ', 'Don Bosco Prep, NJ',
  'Livingston High School, NJ', 'Millburn High School, NJ', 'Montgomery High School, NJ',
  'Moorestown High School, NJ', 'Mount Olive High School, NJ',
  'Northern Valley Regional High School at Demarest, NJ',
  'Randolph High School, NJ', 'Ridge High School, NJ', 'Ridgewood High School, NJ',
  'Roxbury High School, NJ', 'Westfield High School, NJ',
  // New Mexico
  'Albuquerque Academy, NM', 'Del Norte High School, NM',
  // New York
  'Bronx High School of Science, NY', 'Brooklyn Technical High School, NY',
  'Byram Hills High School, NY', 'Chaminade High School, NY', 'Edgemont High School, NY',
  'Horace Mann School, NY', 'Hunter College High School, NY',
  'John Dewey High School, NY', 'Jericho High School, NY', 'Manhasset High School, NY',
  'Midwood High School, NY', 'Niskayuna High School, NY', 'North Salem Central School, NY',
  'Ossining High School, NY', 'Plainview-Old Bethpage John F. Kennedy High School, NY',
  'Roslyn High School, NY', 'Scarsdale High School, NY',
  'Stuyvesant High School, NY', 'Trinity School, NY', 'Ward Melville High School, NY',
  // North Carolina
  'Apex High School, NC', 'Green Hope High School, NC', 'Leesville Road High School, NC',
  'Myers Park High School, NC', 'Panther Creek High School, NC', 'Providence High School, NC',
  'Raleigh Charter High School, NC', 'Research Triangle High School, NC',
  // Ohio
  'Centerville High School, OH', 'Hawken School, OH', 'Hudson High School, OH',
  'Indian Hill High School, OH', 'Mason High School, OH', 'Medina High School, OH',
  'New Albany High School, OH', 'Solon High School, OH', 'Sylvania Northview High School, OH',
  'Walnut Hills High School, OH', 'Westerville Central High School, OH',
  // Oklahoma
  'Broken Arrow High School, OK', 'Edmond Santa Fe High School, OK', 'Jenks High School, OK',
  // Oregon
  'Jesuit High School, OR', 'Lakeridge High School, OR', 'Lake Oswego High School, OR',
  'Southridge High School, OR',
  // Pennsylvania
  'Central York High School, PA', 'Council Rock High School, PA',
  'Haverford School, PA', 'Lower Merion High School, PA', 'Pennsbury High School, PA',
  'Penn Charter School, PA', 'Radnor High School, PA', 'Springside Chestnut Hill Academy, PA',
  'State College Area High School, PA', 'Upper Dublin High School, PA',
  'William Penn Charter School, PA',
  // Rhode Island
  'Classical High School, RI', 'Lincoln School, RI', 'Wheeler School, RI',
  // South Carolina
  'James Island Charter High School, SC', 'Lexington High School, SC', 'South Pointe High School, SC',
  // Tennessee
  'Brentwood High School, TN', 'Farragut High School, TN', 'Martin Luther King Magnet School, TN',
  'Page High School, TN',
  // Texas
  'Allen High School, TX', 'Austin High School, TX', 'Coppell High School, TX',
  'Cypress Ranch High School, TX', 'Flower Mound High School, TX',
  'Frisco High School, TX', 'Highland Park High School, TX', 'Katy High School, TX',
  'Klein Collins High School, TX', 'Lake Travis High School, TX',
  'Leander High School, TX', 'Marcus High School, TX', 'McKinney Boyd High School, TX',
  'Memorial High School (Houston), TX', 'Plano East Senior High School, TX',
  'Plano Senior High School, TX', 'Prosper High School, TX',
  'Round Rock High School, TX', 'Southlake Carroll Senior High School, TX',
  'The Woodlands High School, TX', 'Westlake High School, TX', 'Westwood High School, TX',
  // Utah
  'Lone Peak High School, UT', 'Northridge High School, UT', 'Olympus High School, UT',
  // Vermont
  'Burlington High School, VT', 'South Burlington High School, VT',
  // Virginia
  'Chantilly High School, VA', 'Fairfax High School, VA', 'George Mason High School, VA',
  'Langley High School, VA', 'Lake Braddock Secondary School, VA',
  'McLean High School, VA', 'Robinson Secondary School, VA',
  'Thomas Jefferson High School for Science and Technology, VA',
  'Westfield High School, VA', 'W.T. Woodson High School, VA',
  // Washington
  'Bellevue High School, WA', 'Eastlake High School, WA', 'Interlake High School, WA',
  'Lakeside School, WA', 'Mercer Island High School, WA', 'Newport High School, WA',
  'Sammamish High School, WA',
  // Washington D.C.
  'Georgetown Day School, DC', 'Gonzaga College High School, DC', 'Sidwell Friends School, DC',
  'St. Albans School, DC', 'Wilson High School, DC',
  // West Virginia
  'Morgantown High School, WV', 'Spring Mills High School, WV',
  // Wisconsin
  'Appleton East High School, WI', 'Marquette University High School, WI',
  'Menomonee Falls High School, WI', 'Oconomowoc High School, WI',
  // Wyoming
  'Cheyenne East High School, WY', 'Natrona County High School, WY',
].sort((a, b) => a.localeCompare(b));

function isCollegeLevel(grade: string) {
  return COLLEGE_GRADES.has(grade);
}
function isK12Level(grade: string) {
  return K12_GRADES.has(grade);
}

export default function Profile() {
  const { refresh } = useAuth();
  const [form, setForm]               = useState<ProfileData>({ fullName: '', school: '', gradeLevel: '' });
  const [customSchool, setCustomSchool] = useState('');
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);

  useEffect(() => {
    api.get<{ fullName?: string | null; school?: string | null; gradeLevel?: string | null }>('/profile')
      .then(p => {
        const grade  = p.gradeLevel ?? '';
        const school = p.school ?? '';
        const schoolList = isK12Level(grade) ? US_K12_SCHOOLS : US_COLLEGES;
        const isCustom = school && !schoolList.includes(school) && school !== 'Other';
        setForm({ fullName: p.fullName ?? '', school: isCustom ? 'Other' : school, gradeLevel: grade });
        if (isCustom) setCustomSchool(school);
      })
      .catch(() => {});
  }, []);

  // When grade level changes, reset school selection if it no longer fits the new list
  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGrade = e.target.value;
    setForm(prev => {
      const newList = isK12Level(newGrade) ? US_K12_SCHOOLS : US_COLLEGES;
      const schoolStillValid = !prev.school || prev.school === 'Other' || newList.includes(prev.school);
      return { ...prev, gradeLevel: newGrade, school: schoolStillValid ? prev.school : '' };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaved(false);
    const schoolValue = form.school === 'Other' ? (customSchool.trim() || 'Other') : form.school;
    try {
      await api.patch('/profile', { ...form, school: schoolValue });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const set = (k: keyof ProfileData) => (
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))
  );

  const schoolList   = isK12Level(form.gradeLevel) ? US_K12_SCHOOLS : US_COLLEGES;
  const schoolLabel  = isK12Level(form.gradeLevel) ? 'School' : 'College / University';
  const schoolPlaceholder = isK12Level(form.gradeLevel) ? '— Select your school —' : '— Select your college —';
  const showSchool   = form.gradeLevel !== '' && form.gradeLevel !== 'Other';

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-1 text-white">Profile</h1>
      <p className="text-slate-500 text-sm mb-6">Personalise how your AI tutor knows you.</p>

      <form onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-700/40 p-6 space-y-5"
            style={{ background: 'rgba(1,10,30,0.6)', backdropFilter: 'blur(12px)' }}>

        {/* Name */}
        <div>
          <label className="label">Name</label>
          <input
            className="input"
            placeholder="Jane Smith"
            value={form.fullName}
            onChange={set('fullName')}
          />
        </div>

        {/* Grade Level — first */}
        <div>
          <label className="label">Grade Level</label>
          <select className="input" value={form.gradeLevel} onChange={handleGradeChange}>
            <option value="">— Select your grade level —</option>
            {GRADE_LEVELS.map(({ group, values }) => (
              <optgroup key={group} label={group}>
                {values.map(v => <option key={v} value={v}>{v}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        {/* School — shown only when a grade is selected */}
        {showSchool && (
          <div>
            <label className="label">{schoolLabel}</label>
            <select className="input" value={form.school} onChange={set('school')}>
              <option value="">{schoolPlaceholder}</option>
              {schoolList.map(s => <option key={s} value={s}>{s}</option>)}
              <option value="Other">Other (type below)</option>
            </select>
            {form.school === 'Other' && (
              <input
                className="input mt-2"
                placeholder="Enter your school name…"
                value={customSchool}
                onChange={e => setCustomSchool(e.target.value)}
                autoFocus
              />
            )}
          </div>
        )}

        {/* Save */}
        <div className="flex items-center gap-3 pt-1">
          <button className="btn-glow relative rounded-full" type="submit" disabled={saving}>
            <span className="comet-blur" />
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-green-400 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
              Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
