# Apparel Capacity & Bottleneck Planner

A professional, real-time factory capacity and bottleneck simulation web application built with **Next.js (App Router)** and **Supabase (PostgreSQL)**. Designed for apparel manufacturing operations to simulate rolling 4-week horizons, track department loads (**Cut, Sew, Finish, and Pack**), and manage dynamic loss-rate multipliers.

---

## 🌟 Key Features

1. **Configured Production Lines (Page 1)**:
   - Full CRUD management for factory production lines.
   - Apparel category mapping (`Hoodie`, `Jacket`, `Pants`, `T-Shirt`, `Activewear`).
   - Operational state control: Toggle between **Active** and **Disabled**, or delete obsolete lines while preserving historical audit trails.

2. **Order Management & Input (Page 2)**:
   - Captures core order attributes: Style Name, Apparel Category, Total Units, and Shipment Date Window.
   - Real-time reactive tables displaying active production demand.

3. **Rolling 4-Week Horizon Dashboard & Simulation (Page 3)**:
   - Multi-parameter simulation panel allocating orders to specific lines and target weeks (Week 1 to 4).
   - **Dynamic Calculation**: Automatically applies global loss-rate multipliers (Cut, Sew, Finish, Pack) and weekly operating days.
   - **Bottleneck Detection**: Instantaneous visual indicators (`Available` vs. `FULL` $\ge$100% capacity in red).
   - **Composite Filtering**: Dedicated storage table with multi-criteria filters (Filter by Line and Filter by Week).
   - **Disabled Line Awareness**: Clear visual warning tags (`[Disabled Line]` with dashed borders) for inactive lines still carrying historical loads.

4. **Global Simulation Parameters (Settings)**:
   - Centered UI configuration panel for adjusting factory-wide loss rates and weekly working days with instant horizon recalculation.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js App Router, React, Tailwind CSS
* **Backend & Database**: Supabase (PostgreSQL with Row-Level Security)
* **Deployment**: Render

---

## 🚀 Getting Started Locally

1. **Clone the repository**:
   ```bash
   git clone [https://github.com/Jieying-617/Apparel_Production_Capacity_Planning.git](https://github.com/Jieying-617/Apparel_Production_Capacity_Planning.git)
   cd apparel-capacity-planner