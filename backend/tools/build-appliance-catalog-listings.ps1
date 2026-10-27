$ErrorActionPreference = 'Stop'

# Build a balanced list of real Homecenter Colombia product-page URLs.
# URL titles identify candidate products only; no electrical specifications are inferred.
$base = 'https://www.homecenter.com.co/sodimac-catalyst-bu-prod-browse-sitemaps/'
$rules = @(
  @{ category = 'Lavadora'; quota = 200; pattern = 'lavadora' },
  @{ category = 'Secadora'; quota = 80; pattern = 'secadora' },
  @{ category = 'Nevera'; quota = 500; pattern = 'nevera|refrigerador|congelador' },
  @{ category = 'Aire acondicionado'; quota = 70; pattern = 'aire-acondicionado|mini-?split|minisplit' },
  @{ category = 'Ventilador'; quota = 250; pattern = 'ventilador|abanico' },
  @{ category = 'Televisor'; quota = 350; pattern = 'televisor|smart-tv|tv-' },
  @{ category = 'Consola de videojuegos'; quota = 60; pattern = 'playstation|xbox|nintendo.*switch|consola-mini-arcade|consola-portatil|consola-de-videojuegos|videojuego' },
  @{ category = 'Cocina eléctrica'; quota = 450; pattern = 'microondas|horno-electrico|freidora|air-fryer|cafetera|licuadora|batidora|arrocera|sanduchera|tostadora|parrilla-electrica|olla-electrica' },
  @{ category = 'Pequeños aparatos'; quota = 180; pattern = 'aspiradora|robot-aspirador' },
  @{ category = 'Pequeños aparatos'; quota = 120; pattern = 'plancha|secador|afeitadora|depiladora' },
  @{ category = 'Computador'; quota = 700; pattern = 'computador|laptop|portatil-(computer|computador)|notebook|monitor-(led|gaming|4k)|monitor-para-computador|router-wifi|impresora|proyector' },
  @{ category = 'Iluminación'; quota = 200; pattern = 'bombillo|lampara|iluminacion|luminaria' },
  @{ category = 'Pequeños aparatos'; quota = 60; pattern = 'ducha-electrica|calentador-electrico' },
  @{ category = 'Pequeños aparatos'; quota = 160; pattern = 'parlante|barra-de-sonido|teatro-en-casa|radio' },
  @{ category = 'Herramientas eléctricas'; quota = 150; pattern = 'hidrolavadora|taladro|pulidora|esmeril|sierra-electrica|rotomartillo|atornillador|cortasetos|motosierra|sopladora|compresor' }
)

$sitemaps = 1..6 | ForEach-Object { $base + 'soco-browse-product-sitemap' + $_ + '.xml' }
Write-Output "Sitemaps: $($sitemaps -join ', ')"
$allUrls = [Collections.Generic.List[string]]::new()
foreach ($sitemap in $sitemaps) {
  Write-Output "Reading $sitemap"
  $xml = (Invoke-WebRequest -Uri ([string]$sitemap) -TimeoutSec 60 -UseBasicParsing).Content
  foreach ($match in [regex]::Matches($xml, '<loc>(.*?)</loc>')) {
    $allUrls.Add([System.Net.WebUtility]::HtmlDecode($match.Groups[1].Value).Trim())
  }
}

$exclude = 'mesa-tv|mueble|soporte|cable|repuesto|refaccion|accesorio|estuche|funda-|protector|organizador|control-xbox|control-playstation|juguete|miniatura|decoracion|cuadro-|manguera|carcasa|hisense|tcl-|haier|midea|xiaomi|huawei|lenovo|caja-fuerte|jaula-|mascotas|nevera-portatil|nevera-cava|nevera-plastica|filtro-de-agua|cooler|silla-de-camping|fresa-router|broca|disco-de-esmeril|juego-de-brocas|compresor-tornillo'
$selected = [Collections.Generic.List[object]]::new()
$seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($rule in $rules) {
  $category = $rule.category
  $count = 0
  foreach ($url in $allUrls) {
    if ($count -ge $rule.quota) { break }
    if ($url -notmatch '^https://www\.homecenter\.com\.co/homecenter-co/product/' -or $url -match $exclude -or $url -notmatch $rule.pattern -or -not $seen.Add($url)) { continue }

    $segments = ([uri]$url).AbsolutePath.Trim('/').Split('/')
    $slug = if ($segments.Length -ge 4) { $segments[3] } else { $segments[-1] }
    $title = [System.Net.WebUtility]::UrlDecode(($slug -replace '-', ' '))
    $title = [cultureinfo]::GetCultureInfo('es-CO').TextInfo.ToTitleCase($title.ToLowerInvariant())
    if ([string]::IsNullOrWhiteSpace($title)) { continue }
    $id = if ($segments.Length -ge 5) { $segments[2] } else { $segments[-1] }
    $brand = 'Sin marca identificada'
    $brands = @('Black Decker','Black And Decker','Home Elements','Haceb','Samurai','Samsung','Whirlpool','Electrolux','Challenger','Mabe','Kalley','Abba','Centrales','Universal','Imusa','Oster','Sony','Nintendo','Microsoft','Apple','HP','Dell','Asus','Acer','Epson','Brother','Canon','Boccherini','Olimpo','Sylvania','Philips','Panasonic','Daewoo','Frigidaire','KitchenAid','Kitchenaid','Oster','RCA','JBL','Bose','Sonos','Logitech','Nex','Elite','Kärcher')
    foreach ($candidate in $brands) {
      $brandPattern = '(?i)(^|[- ])' + [regex]::Escape(($candidate -replace ' ', '[- ]?')) + '($|[- ])'
      if ($slug -match $brandPattern) { $brand = $candidate; break }
    }
    $searchAlias = if ($brand -eq 'Sin marca identificada') { $category } else { "$brand $category" }
    $recognizedCategory = if ($category -eq 'Lavadora' -and $title -match '(?i)secadora') { 'Secadora' } else { $category }
    $selected.Add([pscustomobject]@{
      id = "homecenter-$id"
      category = $recognizedCategory
      name = $title
      brand = $brand
      sku = "Homecenter $id"
      aliases = @($searchAlias)
      url = $url
    })
    $count++
  }
  if ($count -lt $rule.quota) { throw "No se completó la cuota de '$category': $count de $($rule.quota). Revisa el sitemap o la regla de categoría." }
}

if ($selected.Count -lt 3000) { throw "El catálogo quedó por debajo del mínimo solicitado: $($selected.Count)." }
if (($selected | Select-Object -ExpandProperty id -Unique).Count -ne $selected.Count) { throw 'El catálogo contiene IDs duplicados.' }
$json = [pscustomobject]@{
  generatedAt = (Get-Date -Format 'yyyy-MM-dd')
  count = $selected.Count
  provenance = 'Homecenter Colombia public product sitemaps; listing title and product link only, no energy specification inferred'
  items = @($selected.ToArray())
} | ConvertTo-Json -Depth 8 -Compress
$destination = Join-Path $PSScriptRoot '../../frontend/appliance-catalog-listings.js'
Set-Content -LiteralPath $destination -Value "window.ApplianceCatalogListings = $json;" -Encoding utf8
Write-Output "Created $($selected.Count) product listings at $destination"
