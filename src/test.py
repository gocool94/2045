import os
readme_path = r"D:\Projects\React-Websites\2045\2045\src\canadian-electoral-districts\canadian-electoral-districts-master\districts\README.md"

# Check if README.md exists
if not os.path.exists(readme_path):
    print(f"🚨 Error: README.md file not found at {readme_path}!")
else:
    # Read and print the first 20 lines of README.md for debugging
    print(f"📂 Reading README.md from: {readme_path}")
    
    with open(readme_path, "r", encoding="utf-8") as file:
        lines = file.readlines()

    print("\n📌 First 20 lines of README.md:\n")
    for i, line in enumerate(lines[:20]):
        print(f"{i+1}: {line.strip()}")
