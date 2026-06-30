# Statistics Knowledge Base

**Version:** 1.0  
**Purpose:** Reusable structural reference for statistics and data science module builds. Supports Statistics Specialist (Agent-07) and QA Auditor.  
**Important:** All module-specific formulas, notation, and worked examples must come from module Tier 1 sources. This base provides structural and conceptual scaffolding only.

---

## 1. Core Areas

| Area | Typical Topics |
|------|---------------|
| Descriptive statistics | Measures of centre, spread, shape, visualisation |
| Probability | Sample spaces, events, rules, distributions |
| Inference | Estimation, confidence intervals, hypothesis testing |
| Regression | Simple linear, multiple, model assessment |
| Data science | Data types, cleaning, visualisation, interpretation |

---

## 2. Standard Formula Structure

Every formula block must include:
1. **Name** — what the formula is called
2. **Symbol** — the formula in standard notation
3. **Variables defined** — every symbol explained
4. **Use case** — when to apply this formula
5. **Assumptions** — what must be true for the formula to be valid
6. **Source** — which lecture slide or textbook section

```
Formula: [Name]
Symbol:  [Mathematical expression]
Where:   [Variable] = [Definition], [Variable] = [Definition]
Use when: [Condition]
Assumptions: [What must hold]
Source: [SRC-ID, slide N]
```

---

## 3. Hypothesis Testing Structure

Every hypothesis test section must follow this workflow:

```
1. State the hypotheses
   H₀: [Null hypothesis — the status quo claim]
   H₁: [Alternative hypothesis — what we're testing for]

2. Determine the test
   [Which test? Why? What assumptions does it require?]

3. Compute the test statistic
   [Formula → substitution → result]

4. Find the p-value (or critical value)
   [Method: p-value approach or critical value approach]

5. Decision rule
   If p-value ≤ α → Reject H₀
   If p-value > α → Fail to reject H₀
   (Note: never "accept H₀")

6. Conclusion
   [In plain language, in context: "There is/is not sufficient evidence to conclude that…"]
```

### Common Errors in Hypothesis Testing

| Error | Correct Statement |
|-------|------------------|
| "Accept H₀" | "Fail to reject H₀" |
| "Prove the null hypothesis" | Hypothesis tests never prove — they provide evidence |
| "p-value is the probability H₀ is true" | p-value is the probability of the observed result if H₀ were true |
| Stating the conclusion without context | Always state the conclusion in terms of the original research question |

---

## 4. Confidence Interval Structure

```
Point estimate ± (Critical value × Standard error)
```

Every CI section must include:
- The formula
- Interpretation: "We are [C]% confident that the true [parameter] lies between [lower] and [upper]"
- Common errors: Do NOT say "95% of values fall in this interval"

---

## 5. Regression Section Structure

### Simple Linear Regression — Required Content
- Model equation and what each term means
- Interpreting the slope coefficient (β₁): "For each one-unit increase in X, Y changes by β₁ units, on average"
- Interpreting the intercept (β₀): "The predicted value of Y when X = 0"
- R² definition and interpretation
- Residuals — what they are and how to check them
- Assumptions (LINE): Linearity, Independence, Normality of residuals, Equal variance

### Multiple Regression — Required Content
- Extension of simple regression to k predictors
- Interpreting each slope: "Holding all other variables constant, for each one-unit increase in Xⱼ…"
- Adjusted R² and why it matters
- Multicollinearity — definition and detection

---

## 6. Probability Rules

| Rule | Formula | When Applied |
|------|---------|-------------|
| Complement | P(Aᶜ) = 1 − P(A) | Easier to find P(not A) |
| Addition (general) | P(A ∪ B) = P(A) + P(B) − P(A ∩ B) | Any events |
| Addition (mutually exclusive) | P(A ∪ B) = P(A) + P(B) | Events cannot both occur |
| Multiplication (general) | P(A ∩ B) = P(A) × P(B\|A) | Any events |
| Multiplication (independent) | P(A ∩ B) = P(A) × P(B) | Events don't affect each other |
| Conditional | P(A\|B) = P(A ∩ B) / P(B) | Probability given B occurred |

---

## 7. Common Distributions

| Distribution | Type | Key Parameter(s) | Common Use |
|-------------|------|-----------------|-----------|
| Normal N(μ, σ²) | Continuous | Mean, variance | Many natural phenomena, inference |
| Standard Normal Z ~ N(0,1) | Continuous | — | Standardised scores, z-tests |
| t-distribution | Continuous | Degrees of freedom | Small samples, t-tests |
| Binomial B(n, p) | Discrete | n trials, p probability | Count of successes |
| Poisson | Discrete | λ (rate) | Count of events in an interval |
| F-distribution | Continuous | df₁, df₂ | ANOVA, regression F-test |
| Chi-squared | Continuous | Degrees of freedom | Goodness of fit, independence tests |

---

## 8. Interpretation Rules

### When interpreting statistical output, always state:
1. The direction of the relationship (positive/negative) if applicable
2. The magnitude (how large is the effect?)
3. The statistical significance (is the result likely due to chance?)
4. The practical significance (does the result matter in the real world?)
5. The context (relate the numbers back to the research question)

### Never:
- State that a non-significant result "proves no relationship exists"
- Report p-value without context
- Confuse statistical significance with practical importance
- Use "prove" in a statistical conclusion

---

## 9. Graph Types and Their Content

| Graph | Shows | Axes |
|-------|-------|------|
| Histogram | Distribution shape and spread | X: variable value; Y: frequency/relative frequency |
| Boxplot | Distribution: median, IQR, outliers | Y: variable value (or X if horizontal) |
| Scatterplot | Relationship between two quantitative variables | X: predictor; Y: response |
| Residual plot | Model fit quality | X: fitted values; Y: residuals |
| Normal Q-Q plot | Whether residuals are normally distributed | X: theoretical quantiles; Y: sample quantiles |
| Bar chart | Comparing categories | X: category; Y: count/proportion |

---

## 10. Notation Standards

| Symbol | Meaning |
|--------|---------|
| μ (mu) | Population mean |
| σ (sigma) | Population standard deviation |
| σ² | Population variance |
| x̄ | Sample mean |
| s | Sample standard deviation |
| s² | Sample variance |
| n | Sample size |
| N | Population size |
| p | Population proportion |
| p̂ | Sample proportion |
| β₀, β₁ | Regression coefficients (population) |
| b₀, b₁ | Regression coefficients (estimated from sample) |
| H₀ | Null hypothesis |
| H₁ | Alternative hypothesis |
| α | Significance level |

Use the notation from the module's Tier 1 sources — if the lecturer uses different symbols, follow the lecturer's notation.
