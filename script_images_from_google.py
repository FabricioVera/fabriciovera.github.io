import csv
import json
import os
import time
import re
import requests
from bs4 import BeautifulSoup

INPUT_FILE = "src/data/mbti_characters.csv"
OUTPUT_FILE = "public/data/mbti_characters.json"
MIN_VOTES = 500


# --- CONFIGURACIÓN GOOGLE ---
def get_image_from_google(query):
    """
    Busca en Google Images. Usa Regex para encontrar URLs de imágenes
    dentro del código fuente, ya que Google oculta los src reales en scripts.
    """
    url = "https://www.google.com/search"

    # IMPORTANTE: tbm="isch" activa la búsqueda de imágenes
    params = {"q": query, "tbm": "isch", "ie": "UTF-8", "oe": "UTF-8"}

    # Usamos un User-Agent común para parecer un navegador real
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        res = requests.get(url, params=params, headers=headers, timeout=10)

        # Si Google nos bloquea (429), lanzamos error
        if res.status_code == 429:
            print(
                f"   ⛔ Google ha bloqueado la IP (Error 429). Esperando más tiempo..."
            )
            time.sleep(10)  # Espera de emergencia
            return None

        # --- ESTRATEGIA: REGEX (Más robusta que BeautifulSoup para Google) ---
        # Google suele guardar la imagen original en patrones JSON dentro del HTML.
        # Buscamos cadenas que empiecen por http y terminen en jpg/png/jpeg

        html = res.text

        # Patrón para encontrar URLs de imágenes (jpg, png, jpeg, webp)
        # Excluimos las que contienen 'google.com' o 'gstatic' (iconos/miniaturas)
        patterns = re.findall(
            r'(https?://[^"]+\.(?:jpg|jpeg|png|webp))', html, re.IGNORECASE
        )

        for img_url in patterns:
            # --- LIMPIEZA CRÍTICA ---
            # Google a veces devuelve URLs con "hex escapes" como \x3d o \u003d
            try:
                # Decodificar caracteres unicode (ej: \u0026 -> &)
                img_url = img_url.encode().decode("unicode-escape")
            except:
                pass

            # Limpieza manual extra por si acaso
            img_url = img_url.replace("\\u003d", "=").replace("\\u0026", "&")

            # --- FILTROS DE CALIDAD ---
            # 1. Ignorar miniaturas de Google (gstatic) o iconos (favicon)
            # 2. Ignorar URLs sospechosamente cortas (el error que tenías antes)
            if (
                "gstatic.com" not in img_url
                and "google.com" not in img_url
                and len(img_url) > 20
            ):
                return img_url

        # --- ESTRATEGIA DE RESPALDO: BEAUTIFULSOUP (Si el regex falla) ---
        soup = BeautifulSoup(res.text, "html.parser")
        images = soup.find_all("img")

        for img in images:
            src = img.get("src")
            if (
                src
                and src.startswith("http")
                and "google.com" not in src
                and "gstatic" not in src
            ):
                return src

    except Exception as e:
        print(f"   (Google falló: {e})")

    return None


def convert_csv_to_json():
    characters = []
    processed_ids = set()

    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
                characters = json.load(f)
                # Creamos un conjunto de IDs ya procesados para búsqueda rápida
                processed_ids = {c["id"] for c in characters}
            print(
                f"✔ Se han cargado {len(characters)} personajes previos. Reanudando..."
            )
        except json.JSONDecodeError:
            print("⚠ El archivo JSON estaba corrupto o vacío. Empezando de cero.")
            characters = []

    try:
        # Intentamos abrir con encoding utf-8, si falla prueba latin-1
        try:
            csvfile = open(INPUT_FILE, newline="", encoding="utf-8")
        except UnicodeDecodeError:
            csvfile = open(INPUT_FILE, newline="", encoding="latin-1")

        with csvfile:
            reader = csv.DictReader(csvfile)
            rows = list(reader)
            total_rows = len(rows)

            print(f"Iniciando proceso para {total_rows} personajes...")

            # Contador para evitar bloqueo
            request_count = 0

            for index, row in enumerate(rows):
                try:
                    votes = int(row.get("four_letter_total_voted", "0") or 0)
                except ValueError:
                    votes = 0

                if votes <= MIN_VOTES:
                    continue

                # Datos básicos
                profile_id = row.get("id")
                name = row.get("name")
                category = row.get("subcategory")

                # --- PASO 2: VERIFICAR SI YA LO TENEMOS ---
                if profile_id in processed_ids:
                    # Si ya existe, saltamos al siguiente sin imprimir nada (o un print discreto)
                    # print(f"Saltando {name} (Ya existe)")
                    continue

                # Si no existe, procedemos a buscar
                print(
                    f"[{index + 1}/{total_rows}] Buscando nuevo: {name} ({category})..."
                )

                query = f"{name} {category} official character image"
                image_url = get_image_from_google(query)

                if image_url:
                    print(f"   -> Encontrada: {image_url}")
                else:
                    print("   -> No encontrada.")

                # Agregamos a la lista en memoria
                new_character = {
                    "id": profile_id,
                    "name": name,
                    "category": category,
                    "subcategory": row.get("subcategory"),
                    "four_letter": row.get("four_letter"),
                    "four_letter_votes": votes,
                    "image": image_url,
                }

                characters.append(new_character)
                processed_ids.add(profile_id)  # Marcamos como procesado

                # --- PASO 3: GUARDADO INCREMENTAL (LA CLAVE) ---
                # Reescribimos el JSON con la lista actualizada en cada éxito.
                # Como el proceso es lento (por el sleep), esto no afecta el rendimiento.
                with open(OUTPUT_FILE, "w", encoding="utf-8") as jsonfile:
                    json.dump(characters, jsonfile, ensure_ascii=False, indent=2)

                # Gestión de pausas para evitar bloqueo de Google
                request_count += 1
                if request_count % 10 == 0:
                    print("   (Pausa de seguridad de 5s...)")
                    time.sleep(5)
                else:
                    time.sleep(2)

        print(
            f"\n✔ Proceso finalizado. {len(characters)} personajes guardados en {OUTPUT_FILE}"
        )

    except FileNotFoundError:
        print(f"Error: No se encuentra el archivo {INPUT_FILE}")


if __name__ == "__main__":
    convert_csv_to_json()
