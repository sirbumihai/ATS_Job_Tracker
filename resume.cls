\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{resume}[2010/07/10 v0.9 Resume class]

\LoadClass[10pt,letterpaper]{article}

\usepackage[parfill]{parskip}
\usepackage{array}
\usepackage{ifthen}

\pagestyle{empty}

\def\namesize{\huge}
\def\nameskip{\medskip}
\def\addressskip{\smallskip}
\def\sectionskip{\smallskip}
\def\sectionlineskip{\medskip}

\newenvironment{rSection}[1]{
  \sectionskip
  \MakeUppercase{\bf #1}
  \sectionlineskip
  \hrule
  \begin{list}{}{
    \setlength{\leftmargin}{0em}
  }
  \item[]
}{
  \end{list}
}

\newenvironment{rSubsection}[4]{
  {\bf #1} \hfill {#2}
  \ifthenelse{\equal{#3}{}}{}{
    \\
    {\em #3} \hfill {\em #4}
  }\smallskip
  \begin{list}{$\cdot$}{\leftmargin=1.5em}
  \itemsep -0.5em \vspace{-0.5em}
}{
  \end{list}
  \vspace{0.2em}
}
