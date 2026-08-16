using System.Globalization;
using System.Text;

namespace backend.Services;

public static class SlugService
{
  public static string FromName(string value)
  {
    var normalized = value.Normalize(NormalizationForm.FormD);
    var builder = new StringBuilder();

    foreach (var character in normalized)
    {
      if (CharUnicodeInfo.GetUnicodeCategory(character) == UnicodeCategory.NonSpacingMark)
      {
        continue;
      }

      var latin = character switch
      {
        'α' or 'Α' => "a", 'β' or 'Β' => "v", 'γ' or 'Γ' => "g", 'δ' or 'Δ' => "d",
        'ε' or 'Ε' => "e", 'ζ' or 'Ζ' => "z", 'η' or 'Η' => "i", 'θ' or 'Θ' => "th",
        'ι' or 'Ι' => "i", 'κ' or 'Κ' => "k", 'λ' or 'Λ' => "l", 'μ' or 'Μ' => "m",
        'ν' or 'Ν' => "n", 'ξ' or 'Ξ' => "x", 'ο' or 'Ο' => "o", 'π' or 'Π' => "p",
        'ρ' or 'Ρ' => "r", 'σ' or 'Σ' or 'ς' => "s", 'τ' or 'Τ' => "t", 'υ' or 'Υ' => "y",
        'φ' or 'Φ' => "f", 'χ' or 'Χ' => "ch", 'ψ' or 'Ψ' => "ps", 'ω' or 'Ω' => "o",
        _ when character >= 'a' && character <= 'z' => character.ToString(),
        _ when character >= 'A' && character <= 'Z' => char.ToLowerInvariant(character).ToString(),
        _ when character >= '0' && character <= '9' => character.ToString(),
        _ => "-"
      };

      builder.Append(latin);
    }

    return string.Join('-', builder.ToString().Split('-', StringSplitOptions.RemoveEmptyEntries));
  }
}
