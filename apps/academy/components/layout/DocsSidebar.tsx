import DocsSidebarServer from "./DocsSidebarServer";

export async function DocsSidebar() {
  return (
    <aside className="hidden lg:block w-72 px-1 py-1">
      <DocsSidebarServer />
    </aside>
  );
}
