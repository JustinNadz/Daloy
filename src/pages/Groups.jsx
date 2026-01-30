import { Users, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Groups = () => {
    return (
        <div className="flex h-screen bg-background">
            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
                {/* Header */}
                <div className="bg-card border-b p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Users className="w-6 h-6 text-primary" />
                            Groups
                        </h1>
                        <Button size="sm" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Create Group
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search groups..."
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Groups List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-card rounded-2xl p-4 hover:bg-accent/50 transition-colors cursor-pointer border">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Users className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold">Sample Group {i}</h3>
                                        <p className="text-sm text-muted-foreground">1.2K members</p>
                                    </div>
                                    <Button size="sm" variant="outline">Join</Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    <div className="bg-card rounded-2xl p-12 text-center mt-8 border">
                        <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No groups yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Join groups to connect with people who share your interests
                        </p>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Create Your First Group
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Groups;
